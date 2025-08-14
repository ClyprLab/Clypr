# Clypr Off-chain Bridge (Starter)

This is a minimal Node.js bridge that communicates with the Clypr canister to:

1. Poll next pending dispatch jobs
2. (Stub) Run AI processing on the job payload
3. Send to a downstream bridge/channel (example: Webhook)
4. Acknowledge delivery status back to the canister

It is intended as a starter for teammates to implement full off-chain adapters and AI routing.

## Directory

- `src/index.js` — main loop: poll -> AI stub -> deliver (webhook) -> ack
- `src/adapters/webhook.js` — simple webhook sender using job.channelConfig
- `src/aiStub.js` — placeholder for AI processing
- `.env.example` — environment variables

## Prerequisites

- Node.js 18+
- Canister deployed with updated Candid (DispatchJob includes channelName/channelConfig)
- Bridge principal added to canister authorization (isAuthorized)

## Setup

```bash
cp .env.example .env
# edit .env with your CANISTER_ID, IC_HOST, etc.

npm install
npm start
```

If you don’t have declarations generated yet, deploy the canister and ensure frontend declarations exist at:
`src/frontend/src/declarations/backend/backend.did.js`

This bridge imports those IDL definitions directly.

## Environment Variables

- `CANISTER_ID` — Clypr backend canister id
- `IC_HOST` — IC host (e.g., https://ic0.app or http://127.0.0.1:4943 for local)
- `BRIDGE_LIMIT` — batch size per poll (default 20)
- `POLL_INTERVAL_MS` — sleep when no jobs (default 500)
- `LOG_LEVEL` — debug|info|warn|error (default info)

Identity (to pass isAuthorized):
- For local dev you can start with anonymous identity; production must set a proper identity and authorize it on-chain. See TODOs in `src/index.js` for wiring a PEM-based identity.

## Notes

- Webhook delivery example respects method, headers, and authType from channelConfig.
- Do NOT log secrets; this starter avoids printing sensitive fields.
- Extend with adapters for email/SMS/push/custom.
