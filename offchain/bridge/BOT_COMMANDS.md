# Clypr Telegram Agent Commands

## Overview

Your Clypr Agent is here to help you verify your identity and manage your Clypr account. I'm your personal assistant for all things Clypr!

## Configuration

The bot settings are configurable through the frontend configuration:

```json
{
  "telegram": {
    "botUsername": "Clypr_bot",
    "botName": "Clypr Agent", 
    "botDescription": "Your personal Clypr Agent for identity verification and notifications",
    "webhookUrl": "https://your-domain.com/telegram/webhook"
  }
}
```

## Available Commands

### `/help`
Shows a comprehensive help message with all available commands and instructions.

**Example:**
```
/help
```

**Response:**
```
👋 Your Clypr Agent

I'm here to help you verify your identity and manage your Clypr account.

What I can do:
• /help - Show this help message
• /verify - Start verification process
• /verify <token> - Verify with a token
• /start <token> - Start and verify with a token

How to verify:
1. Request verification in your Clypr app
2. Copy the verification token
3. Paste it here or use /verify <token>

You can also just paste the token directly - I'll recognize it!
```

### `/start`
Shows a welcome message with instructions on how to use the bot.

**Example:**
```
/start
```

**Response:**
```
👋 Welcome! I'm your Clypr Agent

I'm here to help you verify your identity and manage your Clypr account.

To get started:
1. Request verification in your Clypr app
2. Copy the verification token from the app
3. Paste it here or use /verify <token>

Need help? Just type /help and I'll show you what I can do!
```

### `/start <token>`
Starts the bot and immediately attempts to verify with the provided token.

**Example:**
```
/start abc123def456
```

### `/verify`
Starts the verification process and prompts the user to paste their token.

**Example:**
```
/verify
```

**Response:**
```
🔐 Verification Process

Please paste your verification token now.

You can either:
• Paste the token directly (I'll recognize it!)
• Use /verify <token> with the token

Make sure you're using the complete token from your Clypr app.
```

### `/verify <token>`
Attempts to verify the user with the provided token.

**Example:**
```
/verify abc123def456
```

### Direct Token Paste
Users can paste their verification token directly without any command.

**Example:**
```
abc123def456
```

## User Flow

### Typical Verification Process:

1. **User requests verification** in the Clypr app
2. **App generates a verification token** and sends it to the bridge
3. **User receives the token** from the app
4. **User sends token to bot** using any of the methods above
5. **Bot validates the token** and confirms verification
6. **User receives success message** and can return to the app

### Example Conversation:

```
User: /start
Agent: 👋 Welcome! I'm your Clypr Agent
      I'm here to help you verify your identity and manage your Clypr account.
      To get started:
      1. Request verification in your Clypr app
      2. Copy the verification token from the app
      3. Paste it here or use /verify <token>
      Need help? Just type /help and I'll show you what I can do!

User: abc123def456
Agent: ✅ Perfect! You're all set!
      Your identity has been successfully verified with Clypr.
      You can now return to your Clypr app and continue using all the features.
      Is there anything else I can help you with? 🚀
```

## Frontend Integration

### Channel Creation Flow:

1. **User selects Telegram** as channel type in the frontend
2. **Frontend calls** `requestTelegramVerification(true)` to create placeholder channel
3. **Backend generates token** and returns it with channel ID
4. **Frontend opens Telegram** with the verification token
5. **User completes verification** in Telegram chat
6. **Frontend polls for status** and updates when verification is complete

### Configuration:

The frontend uses configurable bot settings from `clypr-config.json`:

```typescript
import { getTelegramConfig, getTelegramBotStartUrl } from '../utils/config';

const telegramConfig = getTelegramConfig();
const botStartUrl = getTelegramBotStartUrl(token);
```

## Error Messages

### Token Not Found
```
I don't see a verification token in your message. Here's how you can share it with me:

• Just paste the token directly (I'll recognize it!)
• Use /verify <token>
• Use /start <token>

Make sure you're using the complete token from your Clypr app. If you need help, just type /help!
```

### Token Unknown or Expired
```
I don't recognize that verification token - it might be expired or invalid. Please request a new verification in your Clypr app and try again.

You can share the new token with me by:
• Pasting it directly
• Using /verify <token>
• Using /start <token>
```

### Token Expired
```
That verification token has expired. Please request a new verification from your Clypr app.

You can share the new token with me by:
• Pasting it directly
• Using /verify <token>
• Using /start <token>
```

## Testing

To test the bot commands, you can use the test script:

```bash
# Add your chat ID to .env file
echo "TEST_CHAT_ID=your_chat_id" >> .env

# Run tests
npm run test-agent commands
```

## Technical Details

- **Token Format**: Tokens are typically alphanumeric strings
- **Token Expiry**: Tokens expire after 15 minutes by default
- **Duplicate Prevention**: The bot prevents processing the same message multiple times
- **Webhook Response**: Always returns 200 OK to prevent Telegram retries
- **Error Handling**: Graceful error handling with helpful user messages
- **Configuration**: Bot settings are configurable through frontend config

## Support

If you encounter issues:

1. Check the troubleshooting guide: `TELEGRAM_TROUBLESHOOTING.md`
2. Use debug commands: `npm run debug-telegram check`
3. Monitor logs: `LOG_LEVEL=debug npm run dev`
4. Check token status: Visit `http://localhost:3000/debug/tokens`
