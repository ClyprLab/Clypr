# Clypr Technical Architecture (As-built)

- Version: 0.2
- Last Updated: Aug 2025
- Status: Implemented + in-progress items noted

## Overview
Clypr is a privacy gateway built on the Internet Computer. It exposes a public message endpoint other dApps can call and lets users configure rules and channels via a React SPA.

## Components
- Backend canister (Motoko)
  - persistent actor with stable storage
  - Modules: `Types.mo`, `RuleEngine.mo`, `MessageProcessor.mo`, `main.mo`
  - Public dApp endpoints: `resolveUsername` (query), `processMessage` (update)
  - Authenticated admin endpoints: rules/channels/messages CRUD, stats, `registerUsername`
- Frontend SPA (React + Vite + TS)
  - Internet Identity auth
  - Pages: Dashboard, Rules, Channels, Messages, Settings (alias claim)
  - Service uses generated `src/declarations/backend/backend.did.js`
- Internet Identity
  - Prod: https://identity.ic0.app
  - Local: subdomain format per `canisterUtils.ts`
- Webhook Bridge (planned)
  - IC HTTPS outcalls to deliver to Email/SMS/Webhooks in a later phase

## Data Flow
1) dApp → Backend canister `processMessage(recipientUsername, messageType, content)`
2) Backend resolves alias → Principal with `resolveUsername`
3) Load recipient rules/channels → evaluate in `RuleEngine`
4) `MessageProcessor` marks delivered/blocked, persists message, returns receipt
5) [Planned] On Allow/Route, perform HTTPS outcall to external channel provider

## Key Types
- Rule: description? text, dappPrincipal? principal, conditions, actions (allow/block/route/transform/prioritize), priority nat8
- Action: { actionType; channelId? nat; parameters: [(text,text)] }
- MessageContent: { title; body; priority nat8; metadata: [(text,text)] }

## Security
- Public endpoints are intentionally open for interoperability
- Admin endpoints require non-anonymous callers
- Future: rate limiting/allowlists for public calls, signature hints in metadata

## Upgrades & State
- Stable arrays for rules/channels/messages and alias maps
- preupgrade/postupgrade convert between HashMap and stable arrays

## Build & Deploy
- Frontend: Vite; use Node polyfills (buffer). Build to `dist/`
- Backend: dfx canister; use `deploy-ic.sh` for local dev end-to-end
- Use generated declarations from `src/declarations/backend`

## Roadmap Notes
- Implement route/transform actions end-to-end
- Add webhook bridge with retries and delivery status
- Billing via ICRC-1 top-ups (cycles) and quotas
