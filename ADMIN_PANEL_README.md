# 🛡️ PromptForge Admin Panel

## Overview
The Admin Panel provides comprehensive management capabilities for PromptForge v3, including entitlements management, user access control, and system configuration.

## 🚀 Quick Start

### Access Admin Panel
Navigate to `/admin` in your browser to access the admin dashboard.

### Admin Routes
- **Dashboard**: `/admin` - Main admin overview
- **Entitlements**: `/admin/entitlements` - Feature flag management
- **Users**: `/admin/users` - User management (coming soon)
- **Database**: `/admin/database` - Database tools (coming soon)

## 🔑 Entitlements Management

### Canonical Flags
The system manages 5 core feature flags that control access to premium functionality:

| Flag | Category | Description | Default Plan |
|------|----------|-------------|--------------|
| `canUseGptTestReal` | Testing | Live GPT testing functionality | Pro |
| `canExportPDF` | Export | PDF document export | Pro |
| `canExportJSON` | Export | JSON format export | Pro |
| `canExportBundleZip` | Export | Bundle ZIP file export | Enterprise |
| `hasAPI` | Integration | API endpoint access | Enterprise |

### Flag Sources
Flags can be controlled at two levels:
- **Organization Level** (`effective_org`): Affects all users in an organization
- **User Level** (`effective_user`): Overrides organization settings for specific users

### API Endpoints

#### GET `/api/entitlements`
Retrieves entitlements for a specific organization or user.

**Query Parameters:**
- `orgId` (optional): Organization ID
- `userId` (optional): User ID
- `planId` (optional): Plan ID for fallback

**Response:**
```json
{
  "orgId": "org-123",
  "userId": "user-456",
  "canonicalFlags": [
    {
      "flag": "canUseGptTestReal",
      "enabled": true,
      "source": "effective_org",
      "lastUpdated": "2024-01-20T10:00:00Z",
      "metadata": {}
    }
  ],
  "timestamp": "2024-01-20T10:00:00Z"
}
```

#### POST `/api/entitlements`
Updates entitlements for a specific organization or user.

**Request Body:**
```json
{
  "orgId": "org-123",
  "userId": "user-456",
  "flag": "canUseGptTestReal",
  "enabled": true,
  "source": "effective_org",
  "reason": "Admin enabled GPT testing"
}
```

**Response:**
```json
{
  "success": true,
  "entitlement": {
    "flag": "canUseGptTestReal",
    "enabled": true,
    "source": "effective_org",
    "updated_at": "2024-01-20T10:00:00Z",
    "metadata": {
      "updated_by": "admin",
      "reason": "Admin enabled GPT testing",
      "timestamp": "2024-01-20T10:00:00Z"
    }
  },
  "message": "Flag canUseGptTestReal enabled successfully",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## 🗄️ Database Schema

### Entitlements Table
```sql
CREATE TABLE entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id),
  user_id UUID,
  flag VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  source VARCHAR(50) NOT NULL DEFAULT 'effective_org',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either org_id or user_id is set, but not both
  CONSTRAINT check_entity CHECK (
    (org_id IS NOT NULL AND user_id IS NULL) OR 
    (org_id IS NULL AND user_id IS NOT NULL)
  ),
  
  -- Unique constraint per entity per flag
  UNIQUE(org_id, flag),
  UNIQUE(user_id, flag)
);
```

## 🔒 Security Features

### Service Role Access
- Admin API endpoints use `SUPABASE_SERVICE_ROLE_KEY` for database access
- Service role key is only accessible server-side
- Client-side components use public anon key for read operations

### Audit Logging
All entitlement changes are logged with:
- Timestamp
- Admin user identifier
- Reason for change
- Previous and new values
- Source (user vs organization)

### Gating Event Logging
The `logGateHit` function logs all entitlement checks for:
- Analytics and monitoring
- Compliance and audit requirements
- Performance optimization
- Security incident investigation

## 🎯 Usage Examples

### Enable PDF Export for Organization
```bash
curl -X POST /api/entitlements \
  -H "Content-Type: application/json" \
  -d '{
    "orgId": "org-123",
    "flag": "canExportPDF",
    "enabled": true,
    "source": "effective_org",
    "reason": "Upgraded to Pro plan"
  }'
```

### Disable API Access for Specific User
```bash
curl -X POST /api/entitlements \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-456",
    "flag": "hasAPI",
    "enabled": false,
    "source": "effective_user",
    "reason": "Security compliance requirement"
  }'
```

### Check User Entitlements
```bash
curl "/api/entitlements?userId=user-456"
```

## 🧪 Testing

### Local Development
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/admin/entitlements`
3. Use test organization/user IDs to verify functionality

### Test Data
Use these test IDs for development:
- **Organization**: `test-org-123`
- **User**: `test-user-456`

### Mock Entitlements
The system includes fallback logic when the database is unavailable:
- Falls back to plan-based entitlements
- Shows "Fallback Mode" indicator
- Maintains functionality for testing

## 📊 Monitoring & Analytics

### Webhook Integration
Entitlement changes trigger webhook events for:
- Real-time notifications
- Third-party system integration
- Compliance monitoring
- Analytics tracking

### Metrics Dashboard
Track key metrics:
- Active vs inactive flags
- User vs organization level overrides
- Change frequency and patterns
- Compliance status

## 🚨 Troubleshooting

### Common Issues

#### Flag Not Updating
1. Verify organization/user ID is correct
2. Check database connection
3. Verify service role key permissions
4. Check application logs for errors

#### Database Connection Errors
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Check Supabase project status
3. Verify RLS policies allow admin operations
4. Check network connectivity

#### Permission Denied
1. Ensure user has admin role
2. Verify organization membership
3. Check RLS policy configuration
4. Verify service role key scope

### Debug Mode
Enable detailed logging:
```bash
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
```

## 🔄 Cache Invalidation

### Automatic Invalidation
When entitlements are updated:
1. Local state is immediately updated
2. Database cache is invalidated
3. User sessions are refreshed
4. API responses reflect new settings

### Manual Refresh
Users can manually refresh entitlements:
- Browser refresh
- API endpoint calls
- Admin panel refresh button

## 📈 Performance Considerations

### Database Queries
- Entitlements are cached at the application level
- Database queries use efficient indexes
- Bulk operations are supported for multiple flags

### API Response Times
- Typical response time: <100ms
- Cached responses: <10ms
- Database fallback: <200ms

## 🔮 Future Enhancements

### Planned Features
- **Bulk Operations**: Update multiple flags simultaneously
- **Templates**: Predefined entitlement configurations
- **Scheduling**: Time-based entitlement changes
- **Approval Workflows**: Multi-step approval for sensitive changes
- **Integration APIs**: Webhook endpoints for external systems

### Advanced Gating
- **Conditional Logic**: Complex entitlement rules
- **A/B Testing**: Feature flag experimentation
- **Geographic Restrictions**: Location-based access control
- **Time-based Access**: Scheduled feature availability

## 📞 Support

### Documentation
- [API Reference](STRIPE_WEBHOOK_SETUP.md)
- [Deployment Guide](DEPLOYMENT_CHECKLIST.md)
- [Database Schema](db/schema.sql)

### Getting Help
1. Check application logs for error details
2. Verify environment configuration
3. Test with known good data
4. Review database permissions
5. Contact system administrator

---

**Status**: ✅ Production Ready
**Last Updated**: January 2024
**Version**: 3.0.0
