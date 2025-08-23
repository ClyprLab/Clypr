# Telegram Webhook Troubleshooting Guide

## Problem: Verification Token Loop

If your Telegram bot keeps sending "verification token is unknown or broken" messages in a loop, follow these steps:

### 1. Immediate Fix

The code has been updated to prevent loops by:
- Adding duplicate message detection
- Always returning 200 OK to Telegram webhooks
- Proper cleanup of processed messages
- Better error handling

### 2. Reset the Webhook

```bash
# Check current webhook status
npm run debug-telegram check

# Delete the webhook to stop the loop
npm run debug-telegram delete

# Wait 30 seconds, then set it again
npm run setup-webhook set
```

### 3. Check for Pending Updates

```bash
# Check if there are pending updates causing the loop
npm run debug-telegram updates
```

If there are many pending updates, delete the webhook and set it again with `drop_pending_updates: true`.

### 4. Verify Environment Variables

Make sure these are set in your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBHOOK_URL=https://your-domain.com/telegram/webhook
CANISTER_ID=your_canister_id
```

### 5. Test Bot Connection

```bash
npm run debug-telegram test
```

### 6. Monitor Bridge Logs

Start the bridge with debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

Look for these log messages:
- `[telegram] Duplicate message detected, skipping:`
- `[telegram] Token validated successfully:`
- `[telegram] acknowledged job`

## Common Issues and Solutions

### Issue: "Token unknown or expired"

**Cause**: Token has expired or was never registered properly
**Solution**: 
1. Check if the bridge is running and processing jobs
2. Verify the token is being registered in the tokenMap
3. Check the debug endpoint: `http://localhost:3000/debug/tokens`

### Issue: Users don't know how to use the agent

**Cause**: Users need clear instructions on available commands
**Solution**: 
1. Users can use `/help` to see what the agent can do
2. Users can paste tokens directly or use `/verify <token>`
3. Users can use `/start` for welcome message or `/start <token>` to verify

### Issue: Webhook not receiving updates

**Cause**: Webhook URL is incorrect or not accessible
**Solution**:
1. Verify your webhook URL is publicly accessible
2. Check webhook status: `npm run debug-telegram check`
3. Ensure your server is running and the endpoint is working

### Issue: Bridge not processing jobs

**Cause**: Canister connection issues or job polling problems
**Solution**:
1. Check canister ID and IC host configuration
2. Verify the bridge can connect to the canister
3. Check for authentication errors in logs

### Issue: Multiple verification attempts

**Cause**: User sending the same token multiple times
**Solution**: The updated code now prevents duplicate processing

## Debug Commands

```bash
# Check webhook status
npm run debug-telegram check

# Delete webhook
npm run debug-telegram delete

# Get recent updates
npm run debug-telegram updates

# Test bot connection
npm run debug-telegram test

# Reset webhook (delete and prepare for new setup)
npm run debug-telegram reset

# Test agent commands (requires TEST_CHAT_ID in .env)
npm run test-agent commands
```

## Monitoring

### Check Registered Tokens

Visit `http://localhost:3000/debug/tokens` to see:
- Number of active tokens
- Token expiration times
- Job IDs associated with tokens

### Log Analysis

Look for these patterns in logs:

**Good patterns:**
```
[telegram] registered token for job 123
[telegram] Token validated successfully
[telegram] acknowledged job 123 delivered
```

**Problem patterns:**
```
[telegram] Duplicate message detected, skipping
[telegram] Token not found in map
[telegram] Token expired
```

## Agent Commands and Features

Your Clypr Agent supports multiple ways for users to verify:

### Available Commands:
- `/help` - Show what the agent can do
- `/start` - Show welcome message
- `/start <token>` - Verify with a token
- `/verify` - Start verification process
- `/verify <token>` - Verify with a token
- Direct token paste - Users can paste tokens directly

### User Experience:
1. **Welcome Message**: Users get a friendly welcome from their personal agent
2. **Help System**: `/help` provides clear instructions on agent capabilities
3. **Multiple Input Methods**: Users can paste tokens directly or use commands
4. **Clear Error Messages**: Helpful error messages guide users
5. **Success Confirmation**: Encouraging success message when verification completes

## Prevention

To prevent future loops:

1. **Always return 200 OK** to Telegram webhooks
2. **Use duplicate detection** for message processing
3. **Clean up tokens** after processing
4. **Monitor webhook health** regularly
5. **Use proper error handling** that doesn't cause retries

## Emergency Reset

If everything is broken and you need a complete reset:

```bash
# 1. Stop the bridge
# 2. Delete webhook
npm run debug-telegram delete

# 3. Wait 1 minute
# 4. Restart bridge
npm run start

# 5. Set webhook again
npm run setup-webhook set
```

This should resolve the verification token loop issue and prevent it from happening again.
