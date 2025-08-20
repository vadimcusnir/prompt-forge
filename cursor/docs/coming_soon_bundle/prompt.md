# PROMPTFORGE™ v3.0 - Coming Soon Implementation

## Overview
A fully isolated Coming Soon page that auto-installs at project bootstrap and can be easily enabled/disabled without affecting the main application.

## Features

### 🚀 Auto-Installation
- Automatically checks status on app bootstrap
- No manual configuration required
- Seamless integration with existing PromptForge v3 design system

### 🎨 Design Consistency
- Uses existing PromptForge v3 UI components
- Maintains brand colors and typography
- Responsive design for all devices

### 📝 Waitlist Management
- Email and name collection form
- Duplicate email prevention
- Real-time validation
- Success confirmation page

### 🔒 Security & Isolation
- Row Level Security (RLS) enabled
- Multi-tenant architecture support
- No interference with existing routes
- Clean separation of concerns

## Technical Implementation

### Database Schema
```sql
-- Waitlist signups table
CREATE TABLE waitlist_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints
- `POST /api/waitlist` - Handle waitlist signups
- `POST /api/toggle-coming-soon` - Admin toggle (requires auth)
- `GET /api/toggle-coming-soon` - Get current status

### Components
- `ComingSoon` - Main coming soon page
- `AdminToggle` - Admin control panel
- `useComingSoon` - Custom hook for status management

## Installation

### 1. Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Coming Soon Configuration
NEXT_PUBLIC_COMING_SOON=false
NEXT_PUBLIC_ADMIN_TOKEN=your_admin_token
```

### 2. Database Migration
Run the provided SQL migration to create required tables:
```bash
# Execute cursor/docs/supabase_migrations/0013_coming_soon_tables.sql
```

### 3. Component Integration
The Coming Soon page automatically integrates with the main page.tsx and checks status on load.

## Usage

### Enabling Coming Soon
1. Set `NEXT_PUBLIC_COMING_SOON=true` in environment
2. Or use admin panel (Ctrl+Shift+A)
3. Or call API endpoint with admin token

### Disabling Coming Soon
1. Set `NEXT_PUBLIC_COMING_SOON=false` in environment
2. Or use admin panel toggle
3. Or call API endpoint with admin token

### Admin Access
- Press `Ctrl+Shift+A` to access admin panel
- Toggle coming soon status
- View current configuration

## Configuration Options

### Custom Messages
```typescript
// Override default message
NEXT_PUBLIC_COMING_SOON_MESSAGE="Custom Coming Soon Message"
```

### Styling
All styling uses existing PromptForge v3 design tokens:
- Primary: `#d1a954` (gold)
- Background: `#000000` (black)
- Text: `#ffffff` (white)
- Secondary: `#5a5a5a` (gray)

## Export Bundle

### Artifacts
- `prompt.txt` - Raw Cursos agent instruction
- `prompt.md` - This readable specification
- `prompt.json` - Configuration and schema
- `manifest.json` - Bundle metadata
- `checksum.txt` - Integrity verification

### Bundle Structure
```
coming_soon_bundle/
├── prompt.txt
├── prompt.md
├── prompt.json
├── manifest.json
└── checksum.txt
```

## Maintenance

### Monitoring
- Check `/api/toggle-coming-soon` for status
- Monitor waitlist signups in database
- Review admin panel logs

### Updates
- Modify components in `/components/coming-soon.tsx`
- Update API logic in `/app/api/waitlist/route.ts`
- Adjust styling in component files

### Removal
1. Delete component files
2. Remove API routes
3. Drop database tables
4. Clean up imports

## Troubleshooting

### Common Issues
- **Coming Soon not showing**: Check environment variables and database status
- **Form submission fails**: Verify Supabase connection and API keys
- **Admin panel not accessible**: Ensure admin token is set correctly

### Debug Mode
Enable console logging by setting:
```bash
NEXT_PUBLIC_DEBUG=true
```

## Support
For technical support or questions about this implementation, refer to the PROMPTFORGE™ v3 documentation or contact the development team.
