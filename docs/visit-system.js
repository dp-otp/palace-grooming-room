(function() {
    'use strict';

    var STORAGE_KEY = 'pg_checkout_context_v2';

    function safeParse(value, fallback) {
        if (!value) return fallback;
        try {
            return JSON.parse(value);
        } catch (err) {
            return fallback;
        }
    }

    function clone(value) {
        return safeParse(JSON.stringify(value || null), null);
    }

    function roundMoney(value) {
        return Math.round((parseFloat(value) || 0) * 100) / 100;
    }

    function sanitizeText(value) {
        return String(value || '').trim();
    }

    function slugify(value) {
        return sanitizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function normalizeItems(items) {
        return (items || []).map(function(item) {
            var name = sanitizeText(item && item.name ? item.name : 'Service');
            return {
                id: sanitizeText(item && item.id ? item.id : slugify(name)),
                name: name,
                price: roundMoney(item && item.price),
                type: sanitizeText(item && item.type ? item.type : 'service')
            };
        }).filter(function(item) {
            return item.name;
        });
    }

    function toDateOnly(value) {
        var text = sanitizeText(value);
        if (!text) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
        var date = new Date(text);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    }

    function toTimeText(value) {
        return sanitizeText(value);
    }

    function getStorage() {
        try {
            return window.sessionStorage;
        } catch (err) {
            return null;
        }
    }

    function buildCheckoutContext(data) {
        var items = normalizeItems(data && data.items);
        var subtotal = items.reduce(function(sum, item) {
            return sum + roundMoney(item.price);
        }, 0);

        return {
            source: sanitizeText(data && data.source) || 'online_booking',
            channel: sanitizeText(data && data.channel) || 'services_page',
            customerName: sanitizeText(data && data.customerName),
            customerPhone: sanitizeText(data && data.customerPhone),
            customerEmail: sanitizeText(data && data.customerEmail),
            preferredDate: toDateOnly(data && data.preferredDate),
            preferredTime: toTimeText(data && data.preferredTime),
            preferredBarber: sanitizeText(data && data.preferredBarber),
            notes: sanitizeText(data && data.notes),
            items: items,
            serviceIds: items.map(function(item) { return item.id; }),
            serviceSummary: items.map(function(item) { return item.name; }).join(', '),
            subtotal: roundMoney(data && data.subtotal ? data.subtotal : subtotal),
            total: roundMoney(data && data.total ? data.total : subtotal),
            createdAt: new Date().toISOString()
        };
    }

    function setCheckoutContext(data) {
        var storage = getStorage();
        var context = buildCheckoutContext(data);
        if (storage) {
            storage.setItem(STORAGE_KEY, JSON.stringify(context));
        }
        return context;
    }

    function getCheckoutContext() {
        var storage = getStorage();
        return storage ? safeParse(storage.getItem(STORAGE_KEY), null) : null;
    }

    function clearCheckoutContext() {
        var storage = getStorage();
        if (storage) {
            storage.removeItem(STORAGE_KEY);
        }
    }

    function getSourceFromUrl() {
        try {
            var params = new URLSearchParams(window.location.search || '');
            return sanitizeText(params.get('source'));
        } catch (err) {
            return '';
        }
    }

    function buildVisitRecord(options) {
        var source = sanitizeText(options && options.source) || 'direct_payment';
        var context = options && options.context ? options.context : null;
        var payment = options && options.payment ? options.payment : {};
        var itemsDetail = normalizeItems((options && options.items) || payment.itemsDetail || (context && context.items) || []);
        var items = itemsDetail.map(function(item) { return item.name; });
        var createdAt = sanitizeText(payment.createdAt) || new Date().toISOString();
        var visitDate = toDateOnly((context && context.preferredDate) || payment.date || createdAt);
        var paymentMethod = sanitizeText((options && options.paymentMethod) || payment.paymentMethod);

        if (!paymentMethod) {
            if (source === 'walk_in_cash') paymentMethod = 'cash';
            else if (source === 'online_booking') paymentMethod = 'card';
            else paymentMethod = 'unknown';
        }

        var paymentStatus = sanitizeText((options && options.paymentStatus) || payment.status);
        if (!paymentStatus) {
            if (source === 'walk_in_cash') paymentStatus = 'paid';
            else paymentStatus = 'confirmed';
        }

        var visitStatus = sanitizeText(options && options.visitStatus);
        if (!visitStatus) {
            if (source === 'online_booking') visitStatus = paymentStatus === 'confirmed' ? 'confirmed' : 'pending_confirmation';
            else if (source === 'walk_in_cash') visitStatus = 'completed';
            else visitStatus = paymentStatus === 'confirmed' ? 'completed' : 'pending';
        }

        return {
            paymentKey: sanitizeText(options && options.paymentKey),
            paymentReference: sanitizeText(payment.reference),
            stripePaymentId: sanitizeText(payment.stripePaymentId),
            source: source,
            channel: sanitizeText((context && context.channel) || (options && options.channel) || 'system'),
            customerName: sanitizeText((context && context.customerName) || (options && options.customerName)),
            customerPhone: sanitizeText((context && context.customerPhone) || (options && options.customerPhone)),
            customerEmail: sanitizeText((context && context.customerEmail) || (options && options.customerEmail)),
            preferredDate: toDateOnly(context && context.preferredDate),
            preferredTime: toTimeText(context && context.preferredTime),
            preferredBarber: sanitizeText(context && context.preferredBarber),
            notes: sanitizeText((context && context.notes) || (options && options.notes)),
            items: items,
            itemsDetail: itemsDetail,
            serviceIds: itemsDetail.map(function(item) { return item.id; }),
            serviceSummary: items.join(', '),
            subtotal: roundMoney(payment.subtotal || (context && context.subtotal)),
            total: roundMoney(payment.amount || (context && context.total)),
            discount: payment.discount || null,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            visitStatus: visitStatus,
            requiresManagerVerification: false,
            date: visitDate,
            createdAt: createdAt,
            updatedAt: new Date().toISOString()
        };
    }

    function saveVisit(db, paymentKey, visit) {
        if (!db || !paymentKey) return Promise.resolve(null);
        return db.ref('visits/' + paymentKey).set(visit).then(function() {
            return visit;
        });
    }

    function updateVisit(db, paymentKey, updates) {
        if (!db || !paymentKey) return Promise.resolve(null);
        var safeUpdates = clone(updates) || {};
        safeUpdates.updatedAt = new Date().toISOString();
        return db.ref('visits/' + paymentKey).update(safeUpdates);
    }

    function createOpsNotification(db, payload) {
        if (!db || !payload || !payload.type) return Promise.resolve(null);
        return db.ref('opsNotifications').push({
            type: payload.type,
            title: sanitizeText(payload.title),
            body: sanitizeText(payload.body),
            paymentKey: sanitizeText(payload.paymentKey),
            visitKey: sanitizeText(payload.visitKey || payload.paymentKey),
            amount: roundMoney(payload.amount),
            customerName: sanitizeText(payload.customerName),
            createdAt: new Date().toISOString(),
            data: clone(payload.data) || {}
        });
    }

    function getVisitStatusLabel(visit) {
        var status = sanitizeText(visit && visit.visitStatus);
        if (status === 'pending_confirmation') return 'Awaiting confirmation';
        if (status === 'confirmed') return 'Confirmed';
        if (status === 'completed_pending_payment') return 'Awaiting payment check';
        if (status === 'completed') return 'Completed';
        if (status === 'no_show') return 'No-show';
        if (status === 'cancelled') return 'Cancelled';
        if (status === 'rejected') return 'Rejected';
        return status ? status.replace(/_/g, ' ') : 'Pending';
    }

    function getSourceLabel(source) {
        if (source === 'online_booking') return 'Online booking';
        if (source === 'walk_in_cash') return 'Walk-in cash';
        if (source === 'legacy_booking') return 'Legacy booking';
        if (source === 'direct_payment') return 'Direct payment';
        return 'Visit';
    }

    window.PGVisitSystem = {
        buildCheckoutContext: buildCheckoutContext,
        setCheckoutContext: setCheckoutContext,
        getCheckoutContext: getCheckoutContext,
        clearCheckoutContext: clearCheckoutContext,
        getSourceFromUrl: getSourceFromUrl,
        buildVisitRecord: buildVisitRecord,
        saveVisit: saveVisit,
        updateVisit: updateVisit,
        createOpsNotification: createOpsNotification,
        getVisitStatusLabel: getVisitStatusLabel,
        getSourceLabel: getSourceLabel,
        normalizeItems: normalizeItems,
        roundMoney: roundMoney
    };

    // Backwards compatibility alias
    window.GBVisitSystem = window.PGVisitSystem;
})();
