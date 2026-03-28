const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();
const REGION = 'europe-west1';
const TIME_ZONE = 'Europe/London';
const ENGINE_VERSION = '2026.03.23.1';

const DELIVERED_STATUSES = new Set(['completed', 'completed_pending_payment']);
const SETTLED_PAYMENT_STATUSES = new Set(['confirmed', 'paid']);
const PRESERVED_REVIEW_STATUSES = new Set(['sent', 'reviewed', 'skipped']);

function nowIso() {
  return new Date().toISOString();
}

function safeText(value) {
  return String(value == null ? '' : value).trim();
}

function roundMoney(value) {
  return Math.round((parseFloat(value) || 0) * 100) / 100;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePhone(value) {
  return safeText(value).replace(/[^0-9]/g, '');
}

function dayKey(value) {
  const text = safeText(value);
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
}

function getVisitDate(visit) {
  return dayKey(
    (visit && (visit.preferredDate || visit.date || visit.createdAt)) || ''
  );
}

function getVisitServiceSummary(visit, payment) {
  if (safeText(visit && visit.serviceSummary)) return safeText(visit.serviceSummary);
  if (safeArray(visit && visit.items).length) return visit.items.join(', ');
  if (safeArray(payment && payment.items).length) return payment.items.join(', ');
  return 'Service';
}

function getVisitAmount(visit, payment) {
  return roundMoney(
    (visit && (visit.total || visit.subtotal)) ||
      (payment && (payment.amount || payment.subtotal)) ||
      0
  );
}

function getPaymentStatus(visit, payment) {
  return safeText(
    (visit && visit.paymentStatus) || (payment && payment.status) || ''
  ).toLowerCase();
}

function getVisitStatus(visit) {
  return safeText(visit && visit.visitStatus).toLowerCase();
}

function isServiceDelivered(visit) {
  return DELIVERED_STATUSES.has(getVisitStatus(visit));
}

function isPaymentSettled(visit, payment) {
  if (safeText((visit && visit.paymentMethod) || (payment && payment.paymentMethod)).toLowerCase() === 'cash') {
    return true;
  }
  return SETTLED_PAYMENT_STATUSES.has(getPaymentStatus(visit, payment));
}

function getPhoneForVisit(visit) {
  return normalizePhone(visit && (visit.customerPhone || visit.phone));
}

function getSourceLabel(source) {
  const value = safeText(source).toLowerCase();
  if (value === 'online_booking') return 'Online booking';
  if (value === 'qr_walkin') return 'In-shop QR';
  if (value === 'walk_in_cash') return 'Walk-in cash';
  if (value === 'legacy_booking') return 'Legacy booking';
  return 'Visit';
}

function getVisitSnapshot(visit, payment) {
  return {
    customerName: safeText(visit.customerName || visit.name || 'Guest'),
    customerPhone: safeText(visit.customerPhone || visit.phone),
    customerEmail: safeText(visit.customerEmail || visit.email),
    preferredBarber: safeText(visit.preferredBarber),
    serviceSummary: getVisitServiceSummary(visit, payment),
    total: getVisitAmount(visit, payment),
    date: getVisitDate(visit) || dayKey(nowIso()),
    source: safeText(visit.source),
    paymentStatus: getPaymentStatus(visit, payment),
    visitStatus: getVisitStatus(visit),
    updatedAt: nowIso()
  };
}

function recalcClientProfile(existing, visitId, visit, payment) {
  const visitName = safeText(visit && (visit.customerName || visit.name));
  const visitPhone = safeText(visit && (visit.customerPhone || visit.phone));
  const visitEmail = safeText(visit && (visit.customerEmail || visit.email));
  const profile = Object.assign(
    {
      name: visitName || 'Unknown',
      phone: visitPhone,
      email: visitEmail,
      totalVisits: 0,
      totalSpend: 0,
      averageSpend: 0,
      firstVisit: '',
      lastVisit: '',
      preferredService: '',
      preferredBarber: '',
      services: {},
      barbers: {},
      visitKeys: {},
      updatedAt: nowIso()
    },
    existing || {}
  );

  profile.visitKeys = Object.assign({}, profile.visitKeys || {});

  if (visit) {
    profile.visitKeys[visitId] = getVisitSnapshot(visit, payment);
  } else {
    delete profile.visitKeys[visitId];
  }

  const visitEntries = Object.values(profile.visitKeys);
  const services = {};
  const barbers = {};
  let totalSpend = 0;
  let firstVisit = '';
  let lastVisit = '';

  visitEntries.forEach((entry) => {
    const amount = roundMoney(entry.total);
    const date = dayKey(entry.date);
    totalSpend += amount;
    if (!firstVisit || (date && date < firstVisit)) firstVisit = date;
    if (!lastVisit || (date && date > lastVisit)) lastVisit = date;

    safeText(entry.serviceSummary)
      .split(',')
      .map((part) => safeText(part))
      .filter(Boolean)
      .forEach((serviceName) => {
        services[serviceName] = (services[serviceName] || 0) + 1;
      });

    if (safeText(entry.preferredBarber)) {
      barbers[entry.preferredBarber] = (barbers[entry.preferredBarber] || 0) + 1;
    }
  });

  const totalVisits = visitEntries.length;
  profile.name = visitName || profile.name;
  profile.phone = visitPhone || profile.phone;
  profile.email = visitEmail || profile.email;
  profile.totalVisits = totalVisits;
  profile.totalSpend = roundMoney(totalSpend);
  profile.averageSpend = totalVisits ? roundMoney(totalSpend / totalVisits) : 0;
  profile.firstVisit = firstVisit || '';
  profile.lastVisit = lastVisit || '';
  profile.services = services;
  profile.barbers = barbers;
  profile.preferredService = topKey(services);
  profile.preferredBarber = topKey(barbers);
  profile.updatedAt = nowIso();

  return profile;
}

function topKey(obj) {
  const keys = Object.keys(obj || {});
  if (!keys.length) return '';
  return keys.reduce((best, current) => {
    return (obj[current] || 0) > (obj[best] || 0) ? current : best;
  }, keys[0]);
}

function findStaffMatch(staffMap, barberName) {
  const target = safeText(barberName).toLowerCase();
  if (!target) return null;
  return Object.keys(staffMap || {}).reduce((match, key) => {
    if (match) return match;
    const staff = staffMap[key] || {};
    if (safeText(staff.name).toLowerCase() === target) {
      return Object.assign({ _key: key }, staff);
    }
    return null;
  }, null);
}

function buildReviewQueueItem(existing, visitId, visit, payment) {
  return {
    customerName: safeText(visit.customerName || visit.name || existing && existing.customerName || 'Guest'),
    customerPhone: safeText(visit.customerPhone || visit.phone || existing && existing.customerPhone),
    customerEmail: safeText(visit.customerEmail || visit.email || existing && existing.customerEmail),
    service: getVisitServiceSummary(visit, payment),
    amount: getVisitAmount(visit, payment),
    paymentKey: visitId,
    visitKey: visitId,
    status: safeText(existing && existing.status) || 'pending',
    queuedAt: safeText(existing && existing.queuedAt) || nowIso(),
    sentAt: existing && existing.sentAt ? existing.sentAt : null,
    reviewedAt: existing && existing.reviewedAt ? existing.reviewedAt : null,
    source: 'backend',
    backendUpdatedAt: nowIso()
  };
}

function buildCommissionAssignment(existing, visitId, visit, payment, commissionSettings, staffMap) {
  const staffMatch = findStaffMatch(staffMap, visit.preferredBarber);
  if (!staffMatch) return null;

  if (existing && existing.manualOverride) {
    return Object.assign({}, existing, {
      backendUpdatedAt: nowIso(),
      visitStatus: getVisitStatus(visit),
      paymentStatus: getPaymentStatus(visit, payment)
    });
  }

  const defaultRate = parseInt((commissionSettings && commissionSettings.defaultRate) || 40, 10) || 40;
  const staffRates = (commissionSettings && commissionSettings.staffRates) || {};
  const rate = parseInt(staffRates[staffMatch._key] || defaultRate, 10) || defaultRate;
  const amount = getVisitAmount(visit, payment);
  const commission = roundMoney(amount * (rate / 100));

  return {
    staffKey: staffMatch._key,
    staffName: safeText(staffMatch.name),
    paymentKey: visitId,
    amount: amount,
    commission: commission,
    rate: rate,
    date: getVisitDate(visit) || dayKey(nowIso()),
    service: getVisitServiceSummary(visit, payment),
    createdAt: safeText(existing && existing.createdAt) || nowIso(),
    backendUpdatedAt: nowIso(),
    source: existing && existing.source === 'manual' ? 'manual' : 'backend',
    manualOverride: !!(existing && existing.manualOverride),
    visitStatus: getVisitStatus(visit),
    paymentStatus: getPaymentStatus(visit, payment)
  };
}

function shouldQueueReview(visit, payment, reviewSettings) {
  if (!isServiceDelivered(visit)) return false;
  if (!isPaymentSettled(visit, payment)) return false;
  if (!reviewSettings || reviewSettings.autoQueueEnabled === false) return false;
  if (!safeText(reviewSettings.googleReviewUrl)) return false;
  if (!getPhoneForVisit(visit)) return false;
  return getVisitAmount(visit, payment) >= roundMoney(reviewSettings.minimumSpend || 0);
}

function shouldAssignCommission(visit, payment) {
  if (!isServiceDelivered(visit)) return false;
  if (!isPaymentSettled(visit, payment)) return false;
  return !!safeText(visit && visit.preferredBarber);
}

function shouldTrackClient(visit) {
  return isServiceDelivered(visit) && !!getPhoneForVisit(visit);
}

function shouldConsumeInventory(visit) {
  return isServiceDelivered(visit);
}

async function updateEngineStatus(patch) {
  await db.ref('automationV2/system/status').update(
    Object.assign(
      {
        backendOwned: true,
        mode: 'backend',
        version: ENGINE_VERSION,
        region: REGION,
        updatedAt: nowIso()
      },
      patch || {}
    )
  );
}

async function refreshEngineMetrics() {
  const [reviewSnap, clientSnap, commissionSnap, lowStockSnap, pendingSnap] = await Promise.all([
    db.ref('autoManager/reviews/queue').once('value'),
    db.ref('autoManager/clients').once('value'),
    db.ref('autoManager/commissions/assignments').once('value'),
    db.ref('automationV2/alerts/lowStock').once('value'),
    db.ref('automationV2/alerts/pendingPayments').once('value')
  ]);

  const reviewQueue = reviewSnap.val() || {};
  const pendingReviews = Object.values(reviewQueue).filter((item) => safeText(item.status) === 'pending').length;
  const sentReviews = Object.values(reviewQueue).filter((item) => safeText(item.status) === 'sent').length;
  const reviewedReviews = Object.values(reviewQueue).filter((item) => safeText(item.status) === 'reviewed').length;
  const totalClients = Object.keys(clientSnap.val() || {}).length;
  const totalAssignments = Object.keys(commissionSnap.val() || {}).length;
  const lowStockAlerts = Object.keys(lowStockSnap.val() || {}).length;
  const stalePendingPayments = Object.keys(pendingSnap.val() || {}).length;

  await db.ref('automationV2/system/metrics').set({
    pendingReviews,
    sentReviews,
    reviewedReviews,
    totalClients,
    totalAssignments,
    lowStockAlerts,
    stalePendingPayments,
    lastComputedAt: nowIso()
  });
}

async function pushOpsNotification(type, title, body, data) {
  await db.ref('opsNotifications').push({
    type,
    title: safeText(title),
    body: safeText(body),
    createdAt: nowIso(),
    data: data || {}
  });
}

async function syncClientProjection(visitId, before, after, payment) {
  const prevPhone = safeText((await db.ref(`automationV2/index/visitPhones/${visitId}`).once('value')).val());
  const nextPhone = getPhoneForVisit(after);

  if (prevPhone && prevPhone !== nextPhone) {
    const oldClientRef = db.ref(`autoManager/clients/${prevPhone}`);
    const oldSnap = await oldClientRef.once('value');
    if (oldSnap.exists()) {
      const updated = recalcClientProfile(oldSnap.val(), visitId, null, null);
      if (updated.totalVisits > 0) await oldClientRef.set(updated);
      else await oldClientRef.remove();
    }
  }

  if (shouldTrackClient(after)) {
    const clientRef = db.ref(`autoManager/clients/${nextPhone}`);
    const clientSnap = await clientRef.once('value');
    const updated = recalcClientProfile(clientSnap.val(), visitId, after, payment);
    await clientRef.set(updated);
    await db.ref(`automationV2/index/visitPhones/${visitId}`).set(nextPhone);
    await db.ref('autoManager/meta/clientsBuilt').set(true);
    return;
  }

  if (prevPhone) {
    const clientRef = db.ref(`autoManager/clients/${prevPhone}`);
    const clientSnap = await clientRef.once('value');
    if (clientSnap.exists()) {
      const updated = recalcClientProfile(clientSnap.val(), visitId, null, null);
      if (updated.totalVisits > 0) await clientRef.set(updated);
      else await clientRef.remove();
    }
    await db.ref(`automationV2/index/visitPhones/${visitId}`).remove();
  }
}

async function syncReviewProjection(visitId, after, payment, reviewSettings) {
  const reviewRef = db.ref(`autoManager/reviews/queue/${visitId}`);
  const existingSnap = await reviewRef.once('value');
  const existing = existingSnap.val();

  if (shouldQueueReview(after, payment, reviewSettings)) {
    const payload = buildReviewQueueItem(existing, visitId, after, payment);
    if (existing && PRESERVED_REVIEW_STATUSES.has(safeText(existing.status).toLowerCase())) {
      payload.status = existing.status;
    }
    await reviewRef.set(payload);
    return;
  }

  if (existing && !PRESERVED_REVIEW_STATUSES.has(safeText(existing.status).toLowerCase())) {
    await reviewRef.remove();
  }
}

async function syncCommissionProjection(visitId, after, payment, commissionSettings, staffMap) {
  const assignmentRef = db.ref(`autoManager/commissions/assignments/${visitId}`);
  const existingSnap = await assignmentRef.once('value');
  const existing = existingSnap.val();

  if (!shouldAssignCommission(after, payment)) {
    if (existing && !existing.manualOverride) {
      await assignmentRef.remove();
    }
    return;
  }

  const payload = buildCommissionAssignment(existing, visitId, after, payment, commissionSettings, staffMap);
  if (!payload) {
    if (existing && !existing.manualOverride) {
      await assignmentRef.remove();
    }
    return;
  }

  await assignmentRef.set(payload);
}

function productMatchesVisit(product, visit) {
  const linked = safeArray(product && product.linkedServices).map((value) => safeText(value).toLowerCase());
  if (!linked.length) return false;

  const visitIds = safeArray(visit && visit.serviceIds).map((value) => safeText(value).toLowerCase());
  const visitItems = safeArray(visit && visit.items).map((value) => safeText(value).toLowerCase());

  return linked.some((linkedId) => {
    return visitIds.includes(linkedId) || visitItems.some((item) => item.includes(linkedId.replace(/-/g, ' ')) || linkedId.includes(item.replace(/\s+/g, '-')));
  });
}

async function syncInventoryProjection(visitId, after) {
  if (!shouldConsumeInventory(after)) return;
  const productsSnap = await db.ref('autoManager/inventory/products').once('value');
  const products = productsSnap.val() || {};
  const updates = [];

  Object.keys(products).forEach((productId) => {
    const product = products[productId];
    if (!productMatchesVisit(product, after)) return;
    const logKey = `${visitId}__${productId}`;
    updates.push((async () => {
      const logRef = db.ref(`autoManager/inventory/stockLog/${logKey}`);
      const existingLog = await logRef.once('value');
      if (existingLog.exists()) return;

      const usage = Math.max(1, parseFloat(product.usagePerService) || 1);
      await db.ref(`autoManager/inventory/products/${productId}/currentStock`).transaction((current) => {
        const stock = parseFloat(current) || 0;
        return Math.max(0, stock - usage);
      });

      await logRef.set({
        productId,
        productName: safeText(product.name),
        type: 'consumed',
        quantity: -usage,
        reason: 'Backend automation: completed visit',
        paymentKey: visitId,
        timestamp: nowIso(),
        source: 'backend'
      });
    })());
  });

  await Promise.all(updates);
}

async function refreshDailySummaryForDate(dateKeyInput) {
  const dateKey = dayKey(dateKeyInput) || dayKey(nowIso());
  if (!dateKey) return;

  const [visitSnap, paymentSnap, reviewSnap] = await Promise.all([
    db.ref('visits').once('value'),
    db.ref('payments').once('value'),
    db.ref('autoManager/reviews/queue').once('value')
  ]);

  const visits = Object.values(visitSnap.val() || {}).filter((visit) => getVisitDate(visit) === dateKey);
  const payments = Object.values(paymentSnap.val() || {}).filter((payment) => dayKey(payment.date || payment.createdAt) === dateKey);
  const reviewQueue = Object.values(reviewSnap.val() || {}).filter((item) => dayKey(item.queuedAt) === dateKey);

  const completedVisits = visits.filter((visit) => isServiceDelivered(visit)).length;
  const confirmedBookings = visits.filter((visit) => safeText(visit.source) === 'online_booking' && safeText(visit.visitStatus) === 'confirmed').length;
  const walkIns = visits.filter((visit) => safeText(visit.source) !== 'online_booking').length;
  const revenue = payments
    .filter((payment) => SETTLED_PAYMENT_STATUSES.has(safeText(payment.status).toLowerCase()) || payment.isCash)
    .reduce((sum, payment) => sum + roundMoney(payment.amount), 0);
  const pendingPayments = payments.filter((payment) => safeText(payment.status).toLowerCase() === 'pending_verification').length;
  const pendingReviews = reviewQueue.filter((item) => safeText(item.status).toLowerCase() === 'pending').length;

  await db.ref(`automationV2/summaries/daily/${dateKey}`).set({
    date: dateKey,
    totalVisits: visits.length,
    completedVisits,
    confirmedBookings,
    walkIns,
    revenue: roundMoney(revenue),
    pendingPayments,
    pendingReviews,
    generatedAt: nowIso()
  });
}

async function processVisitProjection(visitId, before, after) {
  if (!after) {
    await Promise.all([
      syncClientProjection(visitId, before, null, null),
      db.ref(`autoManager/reviews/queue/${visitId}`).remove(),
      db.ref(`autoManager/commissions/assignments/${visitId}`).remove()
    ]);
    return;
  }

  const [paymentSnap, reviewSettingsSnap, commissionSettingsSnap, staffSnap] = await Promise.all([
    db.ref(`payments/${visitId}`).once('value'),
    db.ref('autoManager/reviews/settings').once('value'),
    db.ref('autoManager/commissions/settings').once('value'),
    db.ref('staff').once('value')
  ]);

  const payment = paymentSnap.val() || {};
  const reviewSettings = reviewSettingsSnap.val() || {};
  const commissionSettings = commissionSettingsSnap.val() || { defaultRate: 40, staffRates: {} };
  const staffMap = staffSnap.val() || {};

  await syncClientProjection(visitId, before, after, payment);
  await syncReviewProjection(visitId, after, payment, reviewSettings);
  await syncCommissionProjection(visitId, after, payment, commissionSettings, staffMap);
  await syncInventoryProjection(visitId, after);
  await refreshDailySummaryForDate(getVisitDate(after) || dayKey(nowIso()));
}

async function auditPendingPayments() {
  const visitsSnap = await db.ref('visits').once('value');
  const visits = visitsSnap.val() || {};
  const now = Date.now();
  const staleThresholdMs = 20 * 60 * 1000;
  const seen = {};

  await Promise.all(
    Object.keys(visits).map(async (visitId) => {
      const visit = visits[visitId];
      const pending = safeText(visit.paymentStatus).toLowerCase() === 'pending_verification';
      const createdAt = new Date(visit.createdAt || nowIso()).getTime();
      if (!pending || Number.isNaN(createdAt) || now - createdAt < staleThresholdMs) {
        await db.ref(`automationV2/alerts/pendingPayments/${visitId}`).remove();
        return;
      }

      seen[visitId] = true;
      const alertRef = db.ref(`automationV2/alerts/pendingPayments/${visitId}`);
      const existing = await alertRef.once('value');
      const staleMinutes = Math.round((now - createdAt) / 60000);

      await alertRef.set({
        visitKey: visitId,
        paymentKey: visit.paymentKey || visitId,
        customerName: safeText(visit.customerName || 'Customer'),
        source: safeText(visit.source),
        staleMinutes,
        createdAt: existing.exists() ? existing.val().createdAt : nowIso(),
        updatedAt: nowIso()
      });

      if (!existing.exists()) {
        await pushOpsNotification(
          'automation_pending_payment',
          'Payment verification is overdue',
          `${safeText(visit.customerName || 'Customer')} has a ${getSourceLabel(visit.source).toLowerCase()} payment waiting ${staleMinutes} minutes.`,
          { visitKey: visitId, source: safeText(visit.source), staleMinutes }
        );
      }
    })
  );

  await updateEngineStatus({ lastPendingAuditAt: nowIso() });
  await refreshEngineMetrics();
}

async function rebuildAllProjections() {
  const visits = (await db.ref('visits').once('value')).val() || {};
  const visitIds = Object.keys(visits);
  let processed = 0;

  for (const visitId of visitIds) {
    await processVisitProjection(visitId, null, visits[visitId]);
    processed += 1;
  }

  await auditPendingPayments();
  await refreshEngineMetrics();
  await updateEngineStatus({
    lastRebuildAt: nowIso(),
    lastRebuildCount: processed
  });
  await db.ref('autoManager/meta/clientsBuilt').set(true);

  return { processed };
}

exports.syncVisitAutomation = functions
  .region(REGION)
  .runWith({ timeoutSeconds: 120, memory: '256MB' })
  .database.ref('/visits/{visitId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists() ? change.before.val() : null;
    const after = change.after.exists() ? change.after.val() : null;
    await processVisitProjection(context.params.visitId, before, after);
    await updateEngineStatus({
      lastVisitSyncAt: nowIso(),
      lastVisitKey: context.params.visitId
    });
    await refreshEngineMetrics();
  });

exports.syncInventoryAlerts = functions
  .region(REGION)
  .database.ref('/autoManager/inventory/products/{productId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists() ? change.before.val() : null;
    const after = change.after.exists() ? change.after.val() : null;
    const alertRef = db.ref(`automationV2/alerts/lowStock/${context.params.productId}`);

    if (!after) {
      await alertRef.remove();
      await refreshEngineMetrics();
      return;
    }

    const currentStock = parseFloat(after.currentStock) || 0;
    const threshold = parseFloat(after.reorderThreshold) || 0;
    const isLow = currentStock <= threshold;
    const wasLow = before ? (parseFloat(before.currentStock) || 0) <= (parseFloat(before.reorderThreshold) || 0) : false;

    if (isLow) {
      await alertRef.set({
        productId: context.params.productId,
        productName: safeText(after.name || 'Product'),
        currentStock,
        reorderThreshold: threshold,
        updatedAt: nowIso()
      });
      if (!wasLow) {
        await pushOpsNotification(
          'automation_low_stock',
          'Low stock alert',
          `${safeText(after.name || 'Product')} is at ${currentStock} and needs restocking.`,
          { productId: context.params.productId, currentStock, reorderThreshold: threshold }
        );
      }
    } else {
      await alertRef.remove();
    }

    await updateEngineStatus({ lastInventorySyncAt: nowIso() });
    await refreshEngineMetrics();
  });

exports.auditPendingPayments = functions
  .region(REGION)
  .pubsub.schedule('every 10 minutes')
  .timeZone(TIME_ZONE)
  .onRun(async () => {
    await auditPendingPayments();
    return null;
  });

exports.buildDailyAutomationSummary = functions
  .region(REGION)
  .pubsub.schedule('every day 23:15')
  .timeZone(TIME_ZONE)
  .onRun(async () => {
    const today = dayKey(nowIso());
    await refreshDailySummaryForDate(today);
    await updateEngineStatus({ lastDailySummaryAt: nowIso(), lastDailySummaryKey: today });
    await refreshEngineMetrics();
    await pushOpsNotification(
      'automation_daily_summary',
      'Daily automation summary updated',
      `Automation summary for ${today} is ready in the admin panel.`,
      { date: today }
    );
    return null;
  });

exports.processAutomationCommand = functions
  .region(REGION)
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  .database.ref('/automationV2/commands/{commandId}')
  .onCreate(async (snapshot, context) => {
    const command = snapshot.val() || {};
    const commandRef = snapshot.ref;
    const type = safeText(command.type).toLowerCase();

    await commandRef.update({
      status: 'running',
      startedAt: nowIso()
    });

    try {
      let result = {};

      if (type === 'rebuild_projections') {
        result = await rebuildAllProjections();
      } else if (type === 'refresh_metrics') {
        await refreshEngineMetrics();
        result = { refreshed: true };
      } else if (type === 'refresh_daily_summary') {
        const targetDate = dayKey(command.date) || dayKey(nowIso());
        await refreshDailySummaryForDate(targetDate);
        result = { date: targetDate };
      } else if (type === 'audit_pending_payments') {
        await auditPendingPayments();
        result = { audited: true };
      } else {
        throw new Error(`Unsupported command type: ${type || 'unknown'}`);
      }

      await commandRef.update({
        status: 'completed',
        completedAt: nowIso(),
        result
      });

      await updateEngineStatus({
        lastCommandAt: nowIso(),
        lastCommandType: type,
        lastCommandStatus: 'completed'
      });

      await pushOpsNotification(
        'automation_command_completed',
        'Automation command completed',
        `${type.replace(/_/g, ' ')} finished successfully.`,
        { commandId: context.params.commandId, type, result }
      );
    } catch (error) {
      await commandRef.update({
        status: 'failed',
        failedAt: nowIso(),
        error: error.message
      });

      await updateEngineStatus({
        lastCommandAt: nowIso(),
        lastCommandType: type,
        lastCommandStatus: 'failed',
        lastErrorAt: nowIso(),
        lastErrorMessage: error.message
      });

      await pushOpsNotification(
        'automation_command_failed',
        'Automation command failed',
        error.message,
        { commandId: context.params.commandId, type }
      );

      throw error;
    }
  });
