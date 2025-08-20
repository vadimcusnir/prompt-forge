# Telegram Integration Setup Guide

This guide will help you set up Telegram integration for the PromptForge notification system.

## 🚀 Quick Setup

### 1. Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send** `/newbot` command
4. **Choose a name** for your bot (e.g., "PromptForge Notifications")
5. **Choose a username** (must end with 'bot', e.g., "promptforge_notifications_bot")
6. **Save the bot token** that BotFather provides

### 2. Get Chat IDs

#### For Individual Chats:
1. **Start a chat** with your bot
2. **Send any message** to the bot
3. **Visit** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. **Find your chat_id** in the response

#### For Group Chats:
1. **Add your bot** to a group
2. **Send a message** in the group
3. **Visit** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. **Find the group chat_id** in the response

#### For Channel Messages:
1. **Add your bot** as an admin to a channel
2. **Post a message** in the channel
3. **Visit** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. **Find the channel chat_id** in the response

### 3. Configure Environment Variables

Update your `.env.local` file with the Telegram configuration:

```bash
# Telegram Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ENABLED=true
TELEGRAM_CHAT_ID=-1001234567890

# Team-specific chat IDs
TELEGRAM_SECURITY_CHAT_ID=-1001234567891
TELEGRAM_DEVOPS_CHAT_ID=-1001234567892
TELEGRAM_EMERGENCY_CHAT_ID=-1001234567893
TELEGRAM_TEAM_LEAD_CHAT_ID=-1001234567894

# Channel mappings
TELEGRAM_CHANNELS_SECURITY=@security_alerts
TELEGRAM_CHANNELS_PERFORMANCE=@performance_monitoring
TELEGRAM_CHANNELS_ERROR=@error_tracking
TELEGRAM_CHANNELS_WARNING=@warnings
TELEGRAM_CHANNELS_INFO=@info
TELEGRAM_CHANNELS_SUCCESS=@success

# Test configuration
TELEGRAM_TEST_CHAT_ID=-1001234567895
```

## 🔧 Advanced Configuration

### Channel Structure

Create the following Telegram channels for organized notifications:

```
@security_alerts      - Security incidents and breaches
@performance_monitoring - System performance alerts
@error_tracking       - Error and failure notifications
@warnings            - Warning messages
@info                - General information
@success             - Success notifications
```

### Team Escalation Channels

Set up dedicated channels for team escalations:

```
@security_team       - Security team notifications
@devops_team         - DevOps team notifications
@emergency_response  - Emergency response team
@team_leads          - Team leadership
```

### Bot Permissions

Ensure your bot has the following permissions:

- **Send Messages** - Required for notifications
- **Pin Messages** - Optional, for important alerts
- **Manage Channels** - If using channel integration

## 📱 Message Formatting

### HTML Formatting

Telegram supports HTML formatting for rich notifications:

```html
<b>🔒 Security Incident Detected</b>

Unauthorized access attempt detected from suspicious IP.

<b>Severity:</b> CRITICAL
<b>Source:</b> auth-service
<b>Tags:</b> #breach #login #suspicious

<b>Details:</b>
<code>{"ip": "192.168.1.100", "user": "admin"}</code>
```

### Emoji Usage

Use emojis to make notifications more readable:

- 🔒 Security
- ⚡ Performance
- ❌ Error
- ⚠️ Warning
- ℹ️ Info
- ✅ Success

## 🧪 Testing

### 1. Test Bot Connection

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "PromptForge Notifications",
    "username": "promptforge_notifications_bot"
  }
}
```

### 2. Test Message Sending

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "<YOUR_CHAT_ID>",
    "text": "Test notification from PromptForge",
    "parse_mode": "HTML"
  }'
```

### 3. Test via Dashboard

Use the notification dashboard to send test messages:

1. Go to `/notifications` in your app
2. Click the "Test Notifications" tab
3. Use the Telegram test buttons
4. Check your Telegram channels for messages

## 🚨 Escalation Setup

### Security Team Escalation

```typescript
// Immediate escalation for security incidents
await sendNotification({
  type: 'security',
  severity: 'critical',
  title: 'Security Breach Detected',
  message: 'Immediate response required',
  source: 'security-monitor',
  tags: ['breach', 'urgent'],
  metadata: {
    escalationLevel: 'security',
    requiresImmediateResponse: true
  }
})
```

### DevOps Team Escalation

```typescript
// Escalation after 30 minutes for performance issues
await sendNotification({
  type: 'performance',
  severity: 'high',
  title: 'Performance Degradation',
  message: 'System performance below threshold',
  source: 'performance-monitor',
  tags: ['performance', 'monitoring'],
  metadata: {
    escalationLevel: 'devops',
    escalationDelay: 30
  }
})
```

## 🔒 Security Considerations

### Bot Token Security

- **Never commit** bot tokens to version control
- **Use environment variables** for all sensitive data
- **Rotate tokens** regularly
- **Limit bot permissions** to minimum required

### Channel Access Control

- **Private channels** for sensitive information
- **Public channels** for general notifications
- **Admin-only channels** for team escalations
- **Audit logging** for all bot actions

### Rate Limiting

Telegram has rate limits:
- **30 messages per second** for bots
- **20 messages per minute** per chat
- **Implement retry logic** for failed messages

## 📊 Monitoring

### Health Checks

Monitor bot health:

```typescript
// Check bot status
const isHealthy = await notificationManager.testTelegramConnection()
if (!isHealthy) {
  console.error('Telegram bot is not responding')
  // Send alert to alternative channel
}
```

### Message Delivery

Track message delivery:

```typescript
// Monitor delivery success
const deliveryStats = await notificationManager.getNotificationStats()
console.log(`Telegram delivery rate: ${deliveryStats.telegram.successRate}%`)
```

### Error Handling

Handle common errors:

```typescript
try {
  await sendTelegramNotification(notification)
} catch (error) {
  if (error.message.includes('chat not found')) {
    console.error('Invalid chat ID')
  } else if (error.message.includes('bot was blocked')) {
    console.error('Bot was blocked by user')
  } else {
    console.error('Telegram API error:', error)
  }
}
```

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production environment
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_production_bot_token
TELEGRAM_ENABLED=true
TELEGRAM_CHAT_ID=your_production_chat_id
```

### 2. Channel Verification

Verify all channels are accessible:

```bash
# Test all channels
for channel in security performance error warning info success; do
  curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
    -d "chat_id=@${channel}_alerts" \
    -d "text=Channel test successful"
done
```

### 3. Monitoring Setup

Set up monitoring for:

- Bot health status
- Message delivery rates
- Error rates and types
- Escalation response times

### 4. Backup Channels

Configure backup notification channels:

- **Slack** as primary
- **Telegram** as secondary
- **Email** as tertiary
- **SMS** for critical alerts

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Responding
```bash
# Check bot status
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Check webhook status
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

#### Messages Not Delivered
```bash
# Check chat permissions
curl "https://api.telegram.org/bot<TOKEN>/getChat" \
  -d "chat_id=<CHAT_ID>"

# Check bot permissions
curl "https://api.telegram.org/bot<TOKEN>/getChatMember" \
  -d "chat_id=<CHAT_ID>" \
  -d "user_id=<BOT_ID>"
```

#### Rate Limiting
```bash
# Check current limits
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

### Debug Mode

Enable debug logging:

```bash
NOTIFICATION_LOG_LEVEL=debug
NOTIFICATION_TELEGRAM_DEBUG=true
```

### Support

For Telegram-specific issues:

1. **Check Telegram API documentation**
2. **Review bot permissions**
3. **Verify chat IDs**
4. **Check rate limits**
5. **Contact Telegram support**

## 📚 Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Bot Development](https://core.telegram.org/bots)
- [Telegram Bot Examples](https://github.com/tdlib/telegram-bot-api)
- [Telegram Channel Management](https://telegram.org/faq_channels)

---

**Note**: Always test thoroughly in development before deploying to production. Monitor bot health and message delivery rates to ensure reliable notifications.
