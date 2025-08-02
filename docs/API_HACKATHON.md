# 🚀 Clypr API (Hackathon Version)

## What's This?
Simple API for our privacy gateway. dApps use this to send messages through us to users.

## How It Works
```
dApp -> Our Gateway -> User's Channel (Email/SMS/Telegram)
```

## Core Endpoints

### 1. Send Message 📨
Send a message to someone's privacy gateway.

```candid
sendMessage : (Message) -> (Result<Text, Error>);
```

Example:
```typescript
// Send a message
const result = await actor.sendMessage({
  title: "New Transaction",
  body: "Your transfer of 5 ICP is complete!",
  priority: 1,
  channelHint: "email" // optional
});
```

### 2. Channel Management 🔌
How users set up their channels.

```candid
// Create a channel
createChannel : (Channel) -> (Result<Text, Error>);

// Get user's channels
getChannels : () -> (vec<Channel>) query;

// Generate channel link for dApps
getChannelLink : () -> (text) query;
```

### 3. Rules 📋
Basic message filtering.

```candid
// Create a rule
createRule : (Rule) -> (Result<Text, Error>);

// Get user's rules
getRules : () -> (vec<Rule>) query;
```

## Types We Use

### Message
```typescript
type Message = {
  title: string;
  body: string;
  priority?: number; // 1-5
  channelHint?: string; // "email", "sms", "telegram"
  metadata?: Record<string, string>;
};
```

### Channel
```typescript
type Channel = {
  type: "email" | "sms" | "telegram";
  value: string; // email address or phone number
  name?: string;
  isVerified: boolean;
};
```

### Rule
```typescript
type Rule = {
  name: string;
  type: "allow" | "block" | "route";
  condition: {
    field: "sender" | "content" | "time";
    op: "contains" | "equals" | "after" | "before";
    value: string;
  };
  action: {
    type: "allow" | "block" | "route";
    channel?: string;
  };
};
```

## Quick Examples

### Send a Message
```typescript
import { Actor } from '@dfinity/agent';
import { idlFactory } from './clypr.did';

// Setup
const actor = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'YOUR_CANISTER_ID'
});

// Send
const result = await actor.sendMessage({
  title: "Hello!",
  body: "Testing our privacy gateway",
  priority: 1
});
```

### Create a Rule
```typescript
// Block messages containing "spam"
const rule = await actor.createRule({
  name: "Block Spam",
  type: "block",
  condition: {
    field: "content",
    op: "contains",
    value: "spam"
  },
  action: {
    type: "block"
  }
});
```

## Status Codes
Keep it simple:
- `Ok`: It worked! 🎉
- `Err`: Something broke 💔
  - `NotFound`: Can't find that thing
  - `NotAllowed`: Nope, can't do that
  - `Failed`: Something went wrong

## Need Help?
- Check our example dApp
- Join our Discord
- Tag us in the hackathon channel

Happy hacking! 🚀
