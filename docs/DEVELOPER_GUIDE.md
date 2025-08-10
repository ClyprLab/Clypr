# Clypr Developer Guide (As-built)

Last Updated: Aug 2025

## Prereqs
- dfx >= 0.15
- Node 18+
- npm

## Quickstart
```bash
# Local end-to-end
./deploy-ic.sh
# Frontend only (dev)
cd src/frontend && npm install && npm run dev
```

## Key IC specifics
- Internet Identity
  - Local uses subdomain URL (see `src/frontend/src/utils/canisterUtils.ts`)
  - Prod uses https://identity.ic0.app
- Vite config
  - IC builds use `vite.config.ic.ts`
  - Polyfills required: buffer
- Declarations
  - Import `src/declarations/backend/backend.did.js` for idlFactory in the frontend
  - Avoid importing `src/declarations/**/index.js` to prevent bundling agent code
- Candid encoding in JS
  - opt T → [] | [value]
  - nat → BigInt

## Backend canister
- persistent actor in `src/backend/main.mo`
- Modules: `Types.mo`, `RuleEngine.mo`, `MessageProcessor.mo`
- Public endpoints (no auth):
  - resolveUsername(username: text) → Result<principal, Error> query
  - processMessage(recipientUsername: text, messageType: text, content: MessageContent) → Result<MessageReceipt, Error>
- Auth endpoints (caller must not be anonymous):
  - registerUsername(username: text) → Result<(), Error>
  - Rules: create/getAll/get/update/delete
  - Channels: create/getAll/get/update/delete
  - Messages: sendMessage/getAll/get
  - Stats: getStats

## Frontend
- React + TS + styled-components
- Auth provider wraps app; use hooks in `src/frontend/src/hooks`
- Service layer `ClyprService.ts`:
  - Uses generated did.js
  - Handles [] | [value] options and BigInt for nat
  - Maps between UI and backend types

## dApp Integration
Minimal example:
```ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../src/declarations/backend/backend.did.js';
const agent = new HttpAgent({ host: 'https://ic0.app' });
const actor = Actor.createActor(idlFactory, { agent, canisterId: '<CANISTER_ID>' });
await actor.processMessage('alice', 'notification', { title: 'Hi', body: 'Welcome', priority: 3, metadata: [['k','v']] });
```

## Upgrades & State
- Stable arrays mirror HashMaps in pre/post-upgrade
- Added alias maps: usernameRegistry, principalToUsername

## Known gaps / Next
- Implement route/transform/prioritize actions
- Add HTTPS outcalls for delivery (webhook bridge)
- Rate limits/allowlists for public calls
- Billing via ICRC‑1 top-ups; add Billing page
