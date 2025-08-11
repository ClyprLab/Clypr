# Clypr API Reference (As-built)

- API Version: 0.2 (Aug 2025)
- Base URL: https://[CANISTER_ID].icp0.io/
- Protocol: HTTPS over IC HTTP Gateway (Candid encoded)
- Auth: Principal-based (most admin methods require an authenticated caller). Public endpoints are open.
- Canister: backend

## Overview
The Clypr canister exposes:
- Public dApp endpoints: resolveUsername (query), notifyAlias (update), notifyPrincipal (update)
- Deprecated: processMessage (update) — use notifyAlias instead
- Authenticated admin endpoints: rules, channels, messages, stats, alias registration

## Auth Model
- Public: resolveUsername, notifyAlias, notifyPrincipal (any principal)
- Auth required: registerUsername, rules/channels CRUD, get* queries for user data, sendMessage (self)

## Types (Candid)
- MessageContent: { title: text; body: text; priority: nat8; metadata: vec tuple(text,text) }
- MessageStatus: variant { received; processing; delivered; blocked; failed }
- ConditionOperator: variant { equals; notEquals; contains; notContains; greaterThan; lessThan; exists; notExists }
- ActionType: variant { allow; block; route; transform; prioritize }
- Action: record { actionType: ActionType; channelId: opt nat; parameters: vec tuple(text,text) }
- Rule: record { id: nat; name: text; description: opt text; dappPrincipal: opt principal; conditions: vec Condition; actions: vec Action; priority: nat8; isActive: bool; createdAt: int; updatedAt: int }
- ChannelType: variant { email; sms; webhook; push; custom: text }
- Channel: record { id: nat; name: text; description: opt text; channelType: ChannelType; config: vec tuple(text,text); isActive: bool; createdAt: int; updatedAt: int }
- Result<T,E>: variant { ok: T; err: Error }
- Error: variant { NotFound; AlreadyExists: opt text; NotAuthorized; InvalidInput: opt text; InternalError; RateLimitExceeded; Other: text }

## dApp Integration (Public Endpoints)

### resolveUsername
Query username → Principal.

candid:
resolveUsername: (text) -> (Result principal Error) query

Example (TS):
```ts
const principalRes = await actor.resolveUsername("alice");
if ('ok' in principalRes) {
  const recipient = principalRes.ok; // Principal
}
```

### notifyAlias (preferred)
Submit a message to a recipient alias.

candid:
notifyAlias: (recipientAlias: text, messageType: text, content: MessageContent) -> (Result MessageReceipt Error)

Example (TS):
```ts
const res = await actor.notifyAlias(
  'alice',
  'notification',
  { title: 'Hello', body: 'Welcome!', priority: 3, metadata: [['k','v']] }
);
if ('ok' in res) {
  const receipt = res.ok; // { messageId, received, timestamp }
}
```

### notifyPrincipal
Submit a message directly to a recipient Principal (bypasses alias resolution).

candid:
notifyPrincipal: (recipient: principal, messageType: text, content: MessageContent) -> (Result MessageReceipt Error)

Example (TS):
```ts
const res = await actor.notifyPrincipal(
  somePrincipal,
  'notification',
  { title: 'Hello', body: 'Welcome!', priority: 3, metadata: [['k','v']] }
);
```

### processMessage (deprecated)
Replaced by notifyAlias for clearer DX. Kept for compatibility.

candid:
processMessage: (recipientUsername: text, messageType: text, content: MessageContent) -> (Result MessageReceipt Error)

## Alias

### registerUsername (auth)
registerUsername: (text) -> (Result null Error)
- Enforces uniqueness and one-alias-per-principal

### getMyUsername (auth, query)
getMyUsername: () -> (Result text Error) query

## Rules (auth)

### createRule
createRule: (name: text, description: opt text, dappPrincipal: opt principal, conditions: vec Condition, actions: vec Action, priority: nat8) -> (Result nat Error)

Option encoding from JS: opt X is [] | [value]
- description: [] | ["..."], dappPrincipal: [] | [Principal]
- Action.channelId: [] | [BigInt(n)]

Example (TS):
```ts
await actor.createRule(
  'Block spam',
  ['Block spammy content'],         // description: opt text
  [],                               // dappPrincipal: opt principal (any dApp)
  [ { field: 'content.body', operator: { contains: null }, value: 'buy now' } ],
  [ { actionType: { block: null }, channelId: [], parameters: [] } ],
  5
);
```

### getRule / getAllRules (query)
getRule: (nat) -> (Result Rule Error) query
getAllRules: () -> (Result vec Rule Error) query

### updateRule / deleteRule
updateRule: (nat, Rule) -> (Result null Error)
deleteRule: (nat) -> (Result null Error)

## Channels (auth)

createChannel: (name: text, description: opt text, channelType: ChannelType, config: vec tuple(text,text)) -> (Result nat Error)
getChannel: (nat) -> (Result Channel Error) query
getAllChannels: () -> (Result vec Channel Error) query
updateChannel: (nat, Channel) -> (Result null Error)
deleteChannel: (nat) -> (Result null Error)

## Messages & Stats (auth)

sendMessage: (messageType: text, content: MessageContent) -> (Result MessageReceipt Error)
getMessage: (text) -> (Result Message Error) query
getAllMessages: () -> (Result vec Message Error) query
getStats: () -> (Result record { rulesCount: nat; channelsCount: nat; messagesCount: nat; blockedCount: nat; deliveredCount: nat } Error) query

## SDK Notes
- Use @dfinity/agent with generated idlFactory from `src/declarations/backend/backend.did.js`
- Candid options are represented as [] | [value]
- nat types map to BigInt in JS/TS

Minimal setup (TS):
```ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../src/declarations/backend/backend.did.js';

const agent = new HttpAgent({ host: 'https://ic0.app' });
const actor = Actor.createActor(idlFactory, { agent, canisterId: '<CANISTER_ID>' });
```

## Rate Limits & Abuse
- Public endpoints should be used responsibly; add allowlists/rate limits at the canister or SDK layer as needed (future work).

## Changelog (Aug 2025)
- Added alias system (registerUsername/getMyUsername/resolveUsername)
- Added public notifyAlias and notifyPrincipal endpoints
- Deprecated processMessage; kept as alias for compatibility
- Extended Rule with dappPrincipal (opt principal)
- Clarified Candid option encoding and nat BigInt usage
