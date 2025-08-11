# Clypr - Decentralized Communication Privacy Relay (MVP)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ICP](https://img.shields.io/badge/Internet%20Computer-icp0.io-orange)](https://internetcomputer.org)

## Overview
Clypr is a privacy gateway on the Internet Computer. Users configure rules and channels; dApps call a public endpoint to deliver messages that are filtered before delivery.

## Live
- Frontend (mainnet): https://5nif7-uaaaa-aaaag-aufha-cai.icp0.io/
- Backend canister (mainnet): 5elod-ciaaa-aaaag-aufgq-cai

## What’s in this MVP
- Alias system: claim a unique username; resolve username → Principal
- Public dApp API: `notifyAlias(alias, messageType, content)` (and `notifyPrincipal`)
- Rules: CRUD with conditions/actions/priorities, optional `dappPrincipal`
- Channels: CRUD with type + config
- Messages: storage + basic processing (allow/block) and receipts

## dApp Integration (JS)
```ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './src/declarations/backend/backend.did.js';
const actor = Actor.createActor(idlFactory, { agent: new HttpAgent({ host: 'https://ic0.app' }), canisterId: '5elod-ciaaa-aaaag-aufgq-cai' });
await actor.notifyAlias('alice', 'notification', { title: 'Hi', body: 'Welcome', priority: 3, metadata: [['k','v']] });
```

## Dev
- Local end-to-end: `./deploy-ic.sh`
- Frontend dev: `cd src/frontend && npm i && npm run dev`
- Use generated declarations at `src/declarations/backend/backend.did.js`
- Candid options use [] | [value]; nat → BigInt

## Docs
- docs/API.md (as-built Candid and examples)
- docs/ARCHITECTURE.md (current system)
- docs/PROGRESS_REPORT.md (status/roadmap)

## Roadmap
- Implement route/transform/prioritize actions end-to-end
- Webhook bridge (HTTPS outcalls)
- Rate limiting/allowlists for public calls
- Billing via ICRC‑1 top-ups

