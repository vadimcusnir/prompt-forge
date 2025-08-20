# PromptForge Notification System

A comprehensive notification and escalation system with Slack integration, GitHub Issues tracking, and automated escalation paths.

## 🚀 Features

### Core Functionality
- **Multi-channel notifications**: Slack, GitHub Issues, Email, Webhooks
- **Automated escalation**: Time-based escalation to appropriate teams
- **Smart routing**: Channel-specific configurations and team assignments
- **Template system**: Reusable notification templates with variables
- **Escalation rules**: Configurable escalation logic based on type and severity
- **Real-time monitoring**: Live dashboard with statistics and testing tools

### Escalation Teams
- **@team-leads**: General team leadership (15 min delay)
- **@devops-team**: Infrastructure and performance issues (30 min delay)
- **@security-team**: Security incidents (5 min delay)
- **@emergency-response**: Critical emergencies (immediate)

### Notification Types
- **Security**: 🔒 Security incidents and breaches
- **Performance**: ⚡ System performance and monitoring
- **Error**: ❌ System errors and failures
- **Warning**: ⚠️ System warnings and alerts
- **Info**: ℹ️ General information and updates
- **Success**: ✅ Successful operations and deployments

### Severity Levels
- **Critical**: Immediate attention required, automatic escalation
- **High**: High priority, escalation after delay
- **Medium**: Medium priority, escalation after longer delay
- **Low**: Low priority, no escalation

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│ Notification API │───▶│ Slack Webhook   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Database Store  │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Escalation Rules │───▶│ GitHub Issues   │
                       └──────────────────┘    └─────────────────┘
```

## 📦 Installation

### 1. Environment Configuration

Copy the environment template and configure your services:

```bash
cp env.notifications.example .env.local
```

Fill in your actual values:
- `SLACK_WEBHOOK_URL`: Your Slack webhook URL
- `GITHUB_TOKEN`: GitHub personal access token
- `GITHUB_OWNER`: Your GitHub organization
- `GITHUB_REPO`: Your GitHub repository

### 2. Database Migration

Run the notification system migration:

```sql
-- Run the migration file
\i db/migrations/0037_notifications_system.sql
```

### 3. Dependencies

Ensure you have the required packages:

```bash
npm install @supabase/supabase-js
```

## 🔧 Configuration

### Slack Configuration

Create Slack webhooks for each channel:

1. Go to your Slack workspace settings
2. Create a new app or use existing one
3. Enable Incoming Webhooks
4. Create webhooks for each channel:
   - `#security-alerts`
   - `#performance-monitoring`
   - `#error-tracking`
   - `#warnings`
   - `#info`
   - `#success`

### GitHub Configuration

1. Create a GitHub Personal Access Token with `repo` scope
2. Configure team assignments in your repository
3. Set up webhook secrets for security

### Escalation Rules

The system comes with pre-configured escalation rules:

```typescript
// Security incidents - immediate escalation
{
  condition: (notification) => 
    notification.type === 'security' && 
    notification.severity === 'critical',
  escalationLevel: 'security',
  delay: 0, // Immediate
  autoAssign: true
}

// Performance issues - escalate to DevOps after 30 minutes
{
  condition: (notification) => 
    notification.type === 'performance' && 
    notification.severity === 'high',
  escalationLevel: 'devops',
  delay: 30, // 30 minutes
  autoAssign: true
}
```

## 💻 Usage

### Basic Notification

```typescript
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const { sendNotification } = useNotifications()
  
  const handleError = async () => {
    await sendNotification({
      type: 'error',
      severity: 'high',
      title: 'API Connection Failed',
      message: 'Unable to connect to external API service',
      source: 'api-service',
      tags: ['api', 'connection', 'failure']
    })
  }
}
```

### Convenience Methods

```typescript
const { 
  sendSecurityAlert,
  sendPerformanceAlert,
  sendErrorAlert,
  sendEmergencyAlert 
} = useNotifications()

// Security incident
await sendSecurityAlert(
  'critical',
  'Unauthorized Access Detected',
  'Multiple failed login attempts from suspicious IP',
  'auth-service',
  ['breach', 'login', 'suspicious']
)

// Emergency alert
await sendEmergencyAlert(
  'Database Connection Lost',
  'Primary database connection has been lost',
  'database-service',
  ['emergency', 'database', 'connection']
)
```

### Deployment Notifications

```typescript
const { sendDeploymentSuccess, sendDeploymentFailure } = useNotifications()

// Success
await sendDeploymentSuccess('production', 'v1.2.3', 'ci-cd-pipeline')

// Failure
await sendDeploymentFailure('staging', 'v1.2.3', 'Build timeout', 'ci-cd-pipeline')
```

## 🎛️ Dashboard

The notification dashboard provides:

- **Real-time statistics**: Total notifications, critical alerts, escalation status
- **Type breakdown**: Distribution by notification type
- **Severity analysis**: Criticality level distribution
- **Escalation tracking**: Team assignment and response times
- **Testing tools**: Send test notifications to verify system

Access the dashboard at `/notifications` or integrate the `NotificationDashboard` component.

## 🔄 API Endpoints

### Send Notification

```http
POST /api/notifications/send
Content-Type: application/json

{
  "type": "security",
  "severity": "critical",
  "title": "Security Breach Detected",
  "message": "Unauthorized access to admin panel",
  "source": "security-monitor",
  "tags": ["breach", "admin", "urgent"],
  "details": {
    "ip": "192.168.1.100",
    "user": "admin",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Get Statistics

```http
GET /api/notifications/send
```

Returns notification statistics and metrics.

## 🚨 Escalation Logic

### Automatic Escalation

1. **Notification received** → Stored in database
2. **Escalation rules evaluated** → Based on type, severity, and time
3. **Timer set** → If escalation is required
4. **Escalation triggered** → After delay period
5. **Team notified** → Via Slack and GitHub Issues
6. **Response tracked** → Until resolution

### Escalation Paths

```
Security Critical → @security-team (immediate)
Performance High → @devops-team (30 min delay)
Error Critical → @team-lead (15 min delay)
Warning High → @team-lead (60 min delay)
Emergency → @emergency-response (immediate)
```

### Manual Escalation

```typescript
// Force immediate escalation
await sendNotification({
  type: 'security',
  severity: 'critical',
  title: 'Manual Escalation Required',
  message: 'This requires immediate team attention',
  source: 'manual-escalation',
  tags: ['manual', 'escalation', 'urgent'],
  metadata: {
    forceEscalation: true,
    escalationLevel: 'emergency'
  }
})
```

## 🔒 Security

### Authentication
- API routes protected with authentication
- Row-level security enabled on database tables
- Environment variables for sensitive configuration

### Rate Limiting
- Configurable rate limits per endpoint
- IP-based throttling
- Abuse prevention mechanisms

### Data Privacy
- Sensitive data encrypted at rest
- Audit logging for all operations
- GDPR-compliant data handling

## 📊 Monitoring

### Health Checks
- API endpoint health monitoring
- Database connection status
- External service availability

### Metrics
- Notification volume and trends
- Escalation response times
- Channel delivery success rates
- Error rates and failure patterns

### Alerts
- System health degradation
- High failure rates
- Escalation delays
- Service outages

## 🧪 Testing

### Test Notifications

Use the dashboard to send test notifications:

1. **Quick Tests**: Info, Warning, Error, Security
2. **Emergency Test**: Triggers immediate escalation
3. **Performance Test**: Tests escalation timing

### Integration Testing

```typescript
// Test notification system
describe('Notification System', () => {
  it('should send security alert', async () => {
    const response = await sendNotification({
      type: 'security',
      severity: 'critical',
      title: 'Test Security Alert',
      message: 'This is a test',
      source: 'test-suite'
    })
    
    expect(response.success).toBe(true)
  })
})
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Configure production credentials
2. **Database**: Run migrations on production database
3. **Slack**: Set up production webhooks and channels
4. **GitHub**: Configure production repository and teams
5. **Monitoring**: Enable health checks and alerting

### CI/CD Integration

```yaml
# GitHub Actions workflow
- name: Send Deployment Notification
  run: |
    curl -X POST ${{ secrets.NOTIFICATION_WEBHOOK }} \
      -H "Content-Type: application/json" \
      -d '{
        "type": "success",
        "severity": "low",
        "title": "Deployment Successful",
        "message": "App deployed to production",
        "source": "github-actions"
      }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Slack webhook failures**
   - Check webhook URL validity
   - Verify channel permissions
   - Check rate limits

2. **GitHub API errors**
   - Validate token permissions
   - Check repository access
   - Verify team assignments

3. **Escalation not working**
   - Check escalation rules configuration
   - Verify team setup
   - Check database triggers

### Debug Mode

Enable debug logging:

```bash
NOTIFICATION_LOG_LEVEL=debug
```

### Health Check

```bash
curl /api/notifications/health
```

## 📚 API Reference

### NotificationManager Class

```typescript
class NotificationManager {
  // Send notification
  async sendNotification(notification: NotificationPayload): Promise<void>
  
  // Get statistics
  async getNotificationStats(): Promise<Record<string, any>>
  
  // Cancel escalation
  cancelEscalation(notificationId: string): void
}
```

### useNotifications Hook

```typescript
const {
  sendNotification,
  sendSecurityAlert,
  sendPerformanceAlert,
  sendErrorAlert,
  sendEmergencyAlert,
  sendDeploymentSuccess,
  sendDeploymentFailure,
  isLoading,
  lastNotification
} = useNotifications()
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new functionality
3. Update documentation
4. Follow security best practices
5. Test escalation logic thoroughly

## 📄 License

This notification system is part of PromptForge and follows the same licensing terms.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check GitHub Issues
4. Contact the development team

---

**Note**: This system is designed for production use with proper security measures. Always test thoroughly in staging environments before deploying to production.
