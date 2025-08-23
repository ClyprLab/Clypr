# Telegram Bot Configuration Guide

## Overview

The Clypr Telegram bot integration is now fully configurable through the frontend configuration file. This allows for easy customization of bot settings without code changes.

## Configuration File

The bot settings are defined in `src/frontend/src/config/clypr-config.json`:

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

## Configuration Options

### `botUsername`
- **Type**: `string`
- **Description**: The Telegram bot username (without the @ symbol)
- **Example**: `"Clypr_bot"`
- **Default**: `"Clypr_bot"`

### `botName`
- **Type**: `string`
- **Description**: Display name for the bot in the frontend UI
- **Example**: `"Clypr Agent"`
- **Default**: `"Clypr Agent"`

### `botDescription`
- **Type**: `string`
- **Description**: Description text shown in the frontend channel creation form
- **Example**: `"Your personal Clypr Agent for identity verification and notifications"`
- **Default**: `"Your personal Clypr Agent for identity verification and notifications"`

### `webhookUrl`
- **Type**: `string`
- **Description**: The webhook URL for the Telegram bot (used for reference)
- **Example**: `"https://your-domain.com/telegram/webhook"`
- **Default**: `"https://your-domain.com/telegram/webhook"`

## Frontend Integration

### Configuration Utility

The frontend provides utility functions to access bot configuration:

```typescript
import { 
  getTelegramConfig, 
  getTelegramBotUrl, 
  getTelegramBotStartUrl 
} from '../utils/config';

// Get all bot configuration
const config = getTelegramConfig();

// Get bot URL
const botUrl = getTelegramBotUrl(); // https://t.me/Clypr_bot

// Get bot start URL with token
const startUrl = getTelegramBotStartUrl(token); // https://t.me/Clypr_bot?start=token
```

### Channel Creation Flow

1. **User selects Telegram** channel type
2. **Frontend loads configuration** using `getTelegramConfig()`
3. **UI displays configurable** bot name and description
4. **Verification process** uses configurable bot username
5. **Success messages** reference the configurable bot name

## Environment-Specific Configuration

### Development
```json
{
  "telegram": {
    "botUsername": "ClyprDev_bot",
    "botName": "Clypr Dev Agent",
    "botDescription": "Development version of your Clypr Agent",
    "webhookUrl": "https://dev.your-domain.com/telegram/webhook"
  }
}
```

### Staging
```json
{
  "telegram": {
    "botUsername": "ClyprStaging_bot",
    "botName": "Clypr Staging Agent",
    "botDescription": "Staging version of your Clypr Agent",
    "webhookUrl": "https://staging.your-domain.com/telegram/webhook"
  }
}
```

### Production
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

## Migration from Hardcoded Values

### Before (Hardcoded)
```typescript
// Old hardcoded approach
window.open(`https://t.me/Clypr_bot?start=${token}`, '_blank');
```

### After (Configurable)
```typescript
// New configurable approach
import { getTelegramBotStartUrl } from '../utils/config';
const startUrl = getTelegramBotStartUrl(token);
window.open(startUrl, '_blank');
```

## Benefits

1. **Environment Flexibility**: Different bot configurations for dev/staging/prod
2. **Easy Customization**: Change bot settings without code deployment
3. **Brand Consistency**: Configurable bot names and descriptions
4. **Maintainability**: Centralized configuration management
5. **User Experience**: Dynamic UI that reflects current bot settings

## Troubleshooting

### Common Issues

1. **Bot not found**: Verify `botUsername` is correct and bot exists
2. **Configuration not loading**: Check JSON syntax in config file
3. **Frontend errors**: Ensure config utility is properly imported

### Debug Commands

```bash
# Check bot configuration
npm run debug-telegram test

# Verify webhook setup
npm run debug-telegram check

# Test bot commands
npm run test-agent commands
```

## Security Considerations

- **Bot Token**: Keep bot tokens secure and never expose in frontend code
- **Webhook URL**: Use HTTPS for production webhook URLs
- **Configuration**: Consider environment variables for sensitive settings
- **Validation**: Validate configuration values before use

## Future Enhancements

- **Dynamic Configuration**: Load configuration from backend API
- **Multi-Bot Support**: Support for multiple bot instances
- **A/B Testing**: Different bot configurations for user segments
- **Analytics**: Track bot usage and performance metrics
