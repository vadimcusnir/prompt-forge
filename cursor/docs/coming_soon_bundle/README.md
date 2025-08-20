# PROMPTFORGE™ v3.0 - Coming Soon Bundle

## Overview
This bundle provides a complete, production-ready implementation of a Coming Soon page with waitlist management for PROMPTFORGE™ v3.0. The implementation is fully isolated, auto-installing, and easily removable without affecting the main application.

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy env.example to .env.local and configure
cp env.example .env.local

# Required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Database Migration
Execute the SQL migration in your Supabase project:
```sql
-- Run cursor/docs/supabase_migrations/0013_coming_soon_tables.sql
```

### 3. Component Installation
The components are already integrated into your project:
- `ComingSoon` - Main coming soon page
- `AdminToggle` - Admin control panel
- `useComingSoon` - Status management hook

### 4. API Routes
API endpoints are automatically available:
- `POST /api/waitlist` - Handle signups
- `POST /api/toggle-coming-soon` - Admin toggle

## 🎯 Features

### ✅ Auto-Installation
- Automatically checks status on app bootstrap
- No manual configuration required
- Seamless integration with existing design

### ✅ Complete Isolation
- No interference with existing routes
- Clean separation of concerns
- Easy removal without side effects

### ✅ Admin Control
- Keyboard shortcut: `Ctrl+Shift+A`
- Real-time toggle functionality
- Status monitoring and configuration

### ✅ Waitlist Management
- Email and name collection
- Duplicate prevention
- Success confirmation
- Database persistence

## 🎨 Design System

The Coming Soon page uses the existing PROMPTFORGE™ v3.0 design system:
- **Primary Color**: `#d1a954` (gold)
- **Background**: `#000000` (black)
- **Text**: `#ffffff` (white)
- **Secondary**: `#5a5a5a` (gray)

All components maintain consistency with your existing UI components and styling.

## 🔧 Configuration

### Environment Variables
```bash
# Coming Soon Control
NEXT_PUBLIC_COMING_SOON=false          # Enable/disable on startup
NEXT_PUBLIC_ADMIN_TOKEN=your_token     # Admin authentication
NEXT_PUBLIC_COMING_SOON_MESSAGE="..."  # Custom message
```

### Database Settings
The system automatically creates and manages:
- `waitlist_signups` table for user data
- `site_settings` table for configuration
- RLS policies for security

## 📱 Usage

### For Users
1. Visit the site when coming soon is enabled
2. Fill out the signup form with email and name
3. Receive confirmation and join waitlist

### For Admins
1. Press `Ctrl+Shift+A` to access admin panel
2. Toggle coming soon status on/off
3. Monitor waitlist signups
4. Configure custom messages

### For Developers
1. Import components as needed
2. Use the `useComingSoon` hook for status
3. Extend API endpoints for custom logic
4. Modify styling in component files

## 🧪 Testing

### Manual Testing
1. Enable coming soon mode
2. Test signup form submission
3. Verify database insertion
4. Test admin toggle functionality
5. Disable and verify normal site operation

### Automated Testing
```bash
# Unit tests for components
npm test components/coming-soon

# Integration tests for API
npm test app/api/waitlist
npm test app/api/toggle-coming-soon

# E2E tests for user flow
npm run test:e2e
```

## 🔒 Security

### Authentication
- Admin operations require valid token
- Bearer token authentication
- Environment-based configuration

### Data Protection
- Row Level Security (RLS) enabled
- Input validation and sanitization
- SQL injection prevention
- Email format validation

### Privacy
- Minimal data collection (email, name)
- GDPR compliance considerations
- Configurable data retention

## 📊 Monitoring

### Metrics
- Waitlist signup counts
- Toggle operation frequency
- Error rates and response times
- User engagement patterns

### Alerts
- High error rates
- Database connection failures
- Admin access attempts
- Performance degradation

## 🗑️ Removal

### Complete Removal
1. Delete component files:
   ```bash
   rm components/coming-soon.tsx
   rm components/admin-toggle.tsx
   rm hooks/use-coming-soon.ts
   ```

2. Delete API routes:
   ```bash
   rm -rf app/api/waitlist
   rm -rf app/api/toggle-coming-soon
   ```

3. Clean up imports in `app/page.tsx`

4. Drop database tables (optional):
   ```sql
   DROP TABLE IF EXISTS waitlist_signups;
   DROP TABLE IF EXISTS site_settings;
   ```

### Partial Removal
- Keep components but disable functionality
- Remove admin access while keeping page
- Maintain database for future use

## 🆘 Troubleshooting

### Common Issues

**Coming Soon not showing:**
- Check environment variables
- Verify database connection
- Check API endpoint status

**Form submission fails:**
- Verify Supabase configuration
- Check API keys and permissions
- Review database policies

**Admin panel not accessible:**
- Ensure admin token is set
- Check keyboard shortcut
- Verify authentication logic

### Debug Mode
Enable detailed logging:
```bash
NEXT_PUBLIC_DEBUG=true
```

### Support
- Check the `prompt.md` for detailed specifications
- Review `prompt.json` for configuration options
- Consult the manifest for bundle information

## 📦 Bundle Contents

```
coming_soon_bundle/
├── prompt.txt          # Raw Cursos agent instruction
├── prompt.md           # Comprehensive documentation
├── prompt.json         # Technical specifications
├── manifest.json       # Bundle metadata
├── checksum.txt        # Integrity verification
└── README.md           # This file
```

## 📄 License

This bundle is part of PROMPTFORGE™ v3.0 and follows the same licensing terms. Use is subject to the PROMPTFORGE™ v3.0 license agreement.

## 🤝 Contributing

To contribute to this bundle:
1. Follow the existing code style
2. Maintain isolation principles
3. Update documentation accordingly
4. Test thoroughly before submission

---

**PROMPTFORGE™ v3.0 - Coming Soon Bundle v1.0.0**
*Complete, isolated, and production-ready*
