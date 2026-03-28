# Palace Grooming Room Automation Engine

This folder contains the Firebase Functions backend that replaces the old browser-owned Auto-Manager logic.

## What It Automates

- review queue projection from completed + settled visits
- commission assignment projection from completed + settled visits
- client intelligence projection from delivered visits
- inventory consumption from delivered visits
- low-stock alerts
- stale pending-payment alerts
- daily summary generation
- rebuild / refresh commands from the admin panel

## Deploy

1. `cd functions`
2. `npm install`
3. `cd ..`
4. `firebase deploy --only functions`

Update `.firebaserc` with your Firebase project ID before deploying.

## Admin Integration

The admin panel reads:

- `automationV2/system/status`
- `automationV2/system/metrics`
- `automationV2/commands`

and can queue rebuild commands under `automationV2/commands`.
