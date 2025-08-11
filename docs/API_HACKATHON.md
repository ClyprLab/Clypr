# 🚀 Clypr API (Hackathon Quickstart)

## TL;DR
- Resolve a username to a Principal: `resolveUsername(username)` (query)
- Send a message to an alias: `notifyAlias(username, messageType, content)` (update)

## Minimal Examples (JS)
```ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../src/declarations/backend/backend.did.js';
const agent = new HttpAgent({ host: 'https://ic0.app' });
const actor = Actor.createActor(idlFactory, { agent, canisterId: '<CANISTER_ID>' });

// 1) Lookup alias
const who = await actor.resolveUsername('alice');
if ('ok' in who) console.log('Principal:', who.ok.toText());

// 2) Send message
await actor.notifyAlias('alice', 'notification', {
  title: 'Hello',
  body: 'World',
  priority: 3,
  metadata: [['k','v']],
});
```

## Types
- MessageContent: `{ title: text; body: text; priority: nat8; metadata: vec tuple(text,text) }`
- Receipt: `{ messageId: text; received: bool; timestamp: int }`

## Notes
- Public methods are open (no auth). Be a good citizen: avoid spamming.
- Admin methods (rules/channels/messages) require an authenticated caller.

## Bonus: Rules
Create a rule to block messages containing "spam":
```ts
await actor.createRule(
  'Block spam',
  ['Optional description'],
  [], // applies to any dApp
  [ { field: 'content.body', operator: { contains: null }, value: 'spam' } ],
  [ { actionType: { block: null }, channelId: [], parameters: [] } ],
  5
);
```
