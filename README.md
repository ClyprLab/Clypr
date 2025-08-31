# Clypr – Decentralized Communication Privacy Relay (MVP / v0.2)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-ICP-orange)](https://internetcomputer.org)
[![Status](https://img.shields.io/badge/Status-Alpha%20MVP-yellow)](#current-status)

> A privacy gateway on the Internet Computer (IC). Users define rules & channels; dApps send messages to public endpoints. Messages are evaluated (filter / queue / block) before any external delivery.

---

## Table of Contents
1. Overview
2. Live Deployment
3. Current Status (Aug 2025)
4. Features
5. Architecture Snapshot
6. Quick Start (Local Dev)
7. dApp Integration Examples
8. Frontend Notes
9. Data & Types (Interfacing From JS)
10. Roadmap / Planned
11. Repository Structure
12. Licensing

---

## 1. Overview
Clypr lets users receive Web3 / dApp notifications without exposing raw contact info. A single canister acts as a personal privacy relay applying user‑defined rules (conditions + actions) and channel routing. Public endpoints (`notifyAlias`, `notifyPrincipal`) are open for interoperability; rule & channel management requires authentication.

## 2. Live Deployment
Frontend (mainnet): https://5nif7-uaaaa-aaaag-aufha-cai.icp0.io/
Backend canister (mainnet): `5elod-ciaaa-aaaag-aufgq-cai`

> NOTE: External channel delivery (email/SMS/webhook outcalls) is not yet enabled in production; messages are processed & queued internally.

## 3. Current Status (Aug 2025)
Implemented:
- Alias (username) system: uniqueness + reverse lookup
- Public messaging endpoints: `notifyAlias`, `notifyPrincipal`, `resolveUsername` (query)
- Rules engine: conditions, actions (allow, block, queue placeholder for route), priority ordering, optional `dappPrincipal` scoping
- Channels: CRUD with typed configs (definitions stored; validation logic in progress)
- Message processing pipeline: create → evaluate rules → status (#delivered simulated or #blocked / #queued)
- Dispatch job planning & internal queue objects (scheduling groundwork)
- Stable storage with upgrade-safe migrations
- Internet Identity auth in frontend
- Basic stats endpoint & dashboard surfaces

In Progress / Partial:
- Route / transform / prioritize actions (data structures present; execution not fully wired end‑to‑end)
- Dispatch job executor & retries (spec data present; worker loop WIP)
- Rate limiting scaffolding (state structs defined; enforcement incomplete)

Missing / Planned (see Roadmap):
- External webhook/email/SMS push via HTTPS outcalls
- Billing / quotas (ICRC‑1 cycles top‑ups)
- Public endpoint rate limiting & allowlists

## 4. Features
Completed MVP scope:
- Unique alias claim & resolution API
- Open dApp messaging (principal or alias addressing)
- Rule definitions (conditions + first-match action semantics)
- Channel catalog & per-user configs
- Message storage & receipts (`MessageReceipt { messageId; received; timestamp }`)
- Frontend SPA (Rules, Channels, Messages, Settings, Dashboard)

Security Notes:
- Public endpoints intentionally open (abuse mitigations pending)
- Auth required for any mutation of user-owned data (rules/channels/messages) & alias registration

## 5. Architecture Snapshot
Components:
- Motoko backend canister (`src/backend/`) with modules: `Types.mo`, `RuleEngine.mo`, `MessageProcessor.mo`, `main.mo`
- React + Vite + TypeScript frontend (`src/frontend/`) consuming generated Candid from `src/declarations/backend/`
- Planned bridge layer for HTTPS outcalls (not yet deployed)

Processing Flow:
1. dApp invokes `notifyAlias(alias, messageType, content)` or `notifyPrincipal(principal, ...)`
2. Alias (if provided) resolved → Principal
3. Rules fetched & sorted by priority; first matching rule sets action
4. Message status assigned (#blocked, #delivered simulated, or #queued for future dispatch)
5. Receipt returned

## 6. Quick Start (Local Dev)
Prereqs: dfx, Node 18+, npm

Backend + Frontend (local canisters + dev server):
```bash
./deploy-ic.sh   # deploy backend locally & generate declarations
cd src/frontend
npm install
npm run dev
```

Frontend only (assuming already deployed canisters):
```bash
cd src/frontend
npm install
npm run dev
```

Regenerate declarations (after canister changes):
```bash
dfx build backend
``` 
> The build updates `src/declarations/backend` which the frontend imports.

## 7. dApp Integration Examples
Install dependency (consumer project): `npm install @dfinity/agent`

Basic alias notification:
```ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './src/declarations/backend/backend.did.js';

const canisterId = '5elod-ciaaa-aaaag-aufgq-cai';
const agent = new HttpAgent({ host: 'https://ic0.app' });
const actor = Actor.createActor(idlFactory, { agent, canisterId });

await actor.notifyAlias(
	'alice',
	'notification',
	{ title: 'Hi', body: 'Welcome', priority: 3, metadata: [['k','v']] }
);
```

Direct principal notification:
```ts
await actor.notifyPrincipal(
	someRecipientPrincipal,
	'notification',
	{ title: 'Ping', body: 'Direct principal send', priority: 1, metadata: [] }
);
```

Resolve alias → Principal:
```ts
const res = await actor.resolveUsername('alice');
if ('ok' in res) console.log('Principal', res.ok);
```

Option encoding (Candid opt) from TS: `[] | [value]`; Nat → `BigInt`.

## 8. Frontend Notes
- Vite + React + TypeScript; polyfills for Buffer in `polyfills.ts`
- Auth via Internet Identity (mainnet + local dev supported)
- Pages: Dashboard, Rules, Channels, Messages, Settings (+ alias claim)
- Service layer uses generated Candid (`backend.did.js`)

## 9. Data & Types (Selected)
Actions implemented now: `allow`, `block` (others scaffolded). Rules carry `priority: nat8`, evaluated ascending. First match wins.

MessageContent sample:
```ts
{ title: 'Hello', body: 'Welcome', priority: 3, metadata: [['k','v']] }
```

Receipt sample:
```ts
{ messageId: 'abc123', received: true, timestamp: BigInt(1693320000000) }
```

See `docs/API.md` for full Candid surface & types.

## 10. Roadmap / Planned
Short-Term:
- Execute route / transform / prioritize actions end-to-end
- Implement dispatch executor & retries (jobs → external delivery)
- Webhook bridge (HTTPS outcalls) for email/SMS/webhook channels

Medium-Term:
- Rate limiting & allowlists for public endpoints
- Billing & quotas (ICRC‑1 top-ups / cycles) + usage dashboard
- JS SDK wrapper (ergonomic alias + receipt helpers)

Long-Term / Exploratory:
- Advanced analytics (rule hit rates, sender profiling)
- Multi-canister sharding & indexing service
- End-user templating & message transformation DSL

## 11. Repository Structure (High-Level)
See `docs/PROJECT_STRUCTURE.md` for full tree.
```
src/backend/        # Motoko canister code
src/declarations/   # Generated Candid bindings
src/frontend/       # React SPA
docs/               # Architecture, API, guides, roadmap
deploy-ic.sh        # Local deploy helper
```

## 12. Licensing
MIT License – see `LICENSE`.

---
For deeper details consult:
- `docs/API.md` – Public + admin method reference
- `docs/ARCHITECTURE.md` – In-depth design & flow
- `docs/PROGRESS_REPORT.md` – Detailed status + next steps

Contributions & feedback welcome (see `docs/CONTRIBUTING.md`).

