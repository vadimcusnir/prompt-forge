# Export Bundle System - PROMPTFORGE™ v3

## Overview

The Export Bundle System provides comprehensive artifact generation with plan-based monetization gating. Each export produces standardized artifacts including prompts, telemetry, checksums, and manifests for audit and commercial use.

## Architecture

### Core Components

- **ExportBundleManager** (`lib/export-bundle.ts`) - Main orchestration class
- **Export Manager UI** (`components/export-manager.tsx`) - React component with plan gating
- **Export Bundle API** (`app/api/export-bundle/route.ts`) - REST endpoint for programmatic access
- **Entitlements System** (`lib/entitlements/types.ts`) - Plan definitions and feature gates

### Artifact Types

| Artifact | Format | Description | Plan Required |
|----------|--------|-------------|---------------|
| `prompt.txt` | Text | Human-readable prompt with metadata | Free |
| `prompt.md` | Markdown | Formatted prompt with tables | Creator+ |
| `prompt.json` | JSON | Structured data export | Pro+ |
| `prompt.pdf` | PDF | Professional document format | Pro+ |
| `telemetry.json` | JSON | Execution metrics and KPIs | All |
| `manifest.json` | JSON | Bundle metadata and checksums | All |
| `checksum.txt` | Text | SHA-256 integrity verification | All |
| `*.zip` | ZIP | Complete bundle archive | Enterprise |

## Plan-Based Gating

### Free Plan
- ✅ TXT export
- ❌ MD export
- ❌ JSON export  
- ❌ PDF export
- ❌ ZIP bundle
- ❌ API access

### Creator Plan
- ✅ TXT export
- ✅ MD export
- ❌ JSON export
- ❌ PDF export
- ❌ ZIP bundle
- ❌ API access

### Pro Plan
- ✅ TXT export
- ✅ MD export
- ✅ JSON export
- ✅ PDF export
- ❌ ZIP bundle
- ❌ API access

### Enterprise Plan
- ✅ TXT export
- ✅ MD export
- ✅ JSON export
- ✅ PDF export
- ✅ ZIP bundle
- ✅ API access

## Implementation Details

### Export Bundle Generation

```typescript
import { ExportBundleManager } from '@/lib/export-bundle'

const bundle = await ExportBundleManager.generateBundle({
  prompt: generatedPrompt,
  testResults: testResults,
  editResults: editResults,
  userPlan: 'pro',
  includeTelemetry: true,
  includeChecksum: true,
  includeManifest: true
})
```

### Plan Validation

```typescript
import { getAvailableExportFormats, validateExportPermissions } from '@/lib/entitlements/types'

// Get available formats for a plan
const formats = getAvailableExportFormats('pro') // ['txt', 'md', 'json', 'pdf']

// Validate export permissions
const allowed = validateExportPermissions('pro', ['json', 'pdf']) // true
```

### API Usage

```bash
# Generate export bundle
POST /api/export-bundle
{
  "prompt": {...},
  "testResults": [...],
  "editResults": [...],
  "userPlan": "pro",
  "format": "pdf"
}

# Get plan information
GET /api/export-bundle?plan=pro
```

## Artifact Specifications

### TXT Format
- Plain text with structured sections
- Includes PROMPTFORGE™ branding
- Seven dimensions metadata
- Test results and edit history
- License notice for commercial use

### MD Format
- GitHub-compatible markdown
- Tables for metadata
- Code blocks for prompt content
- Emojis for test status
- Professional formatting

### JSON Format
- Structured data export
- Nested metadata objects
- Test results array
- Edit history timeline
- Seven dimensions configuration

### PDF Format
- Professional document layout
- Company branding
- Structured sections
- Print-ready formatting
- Digital signature support (future)

### Manifest
- Bundle metadata
- File inventory
- Checksum verification
- Plan restrictions
- Branding information
- License compliance

### Telemetry
- Execution metrics
- Performance data
- User interaction logs
- Quality gate results
- Export analytics

## Quality Gates

Export is only allowed when:
1. **DoR (Definition of Ready)** - All prerequisites met
2. **DoD (Definition of Done)** - Quality score ≥ 80
3. **Plan Validation** - User has access to requested format
4. **Content Validation** - No sensitive data detected

## Security & Compliance

### Data Protection
- DLP (Data Loss Prevention) scanning
- Sensitive content detection
- Export audit logging
- User permission validation

### License Compliance
- Copyright notices
- Commercial use restrictions
- Attribution requirements
- Audit trail maintenance

### Integrity Verification
- SHA-256 checksums
- Manifest validation
- Bundle verification
- Tamper detection

## Monetization Strategy

### Freemium Model
- **Free**: Basic TXT export (lead generation)
- **Creator**: +MD export (content creators)
- **Pro**: +JSON/PDF export (professionals)
- **Enterprise**: +ZIP bundle + API (organizations)

### Upgrade Triggers
- Format restrictions
- Feature limitations
- Usage quotas
- Support levels

### Revenue Optimization
- Plan differentiation
- Feature exclusivity
- Usage analytics
- Conversion tracking

## Testing

### Unit Tests
```bash
npm test lib/export-bundle.test.ts
```

### Test Coverage
- Plan-based gating
- Artifact generation
- Format validation
- Error handling
- Checksum consistency

### Mock Data
- Sample prompts
- Test results
- Edit history
- Various plan configurations

## Future Enhancements

### Planned Features
- Real PDF generation (jsPDF/puppeteer)
- ZIP compression (JSZip)
- Cloud storage integration
- Batch export processing
- Custom branding options

### API Improvements
- GraphQL support
- Webhook notifications
- Rate limiting
- Caching layers
- Analytics endpoints

### Enterprise Features
- White-label branding
- Custom export templates
- Advanced DLP rules
- Compliance reporting
- Multi-tenant support

## Troubleshooting

### Common Issues

**Export blocked by quality gates**
- Check DoR/DoD validation
- Review test results
- Verify prompt quality score

**Format not available for plan**
- Upgrade to higher plan
- Check plan entitlements
- Verify feature flags

**Bundle generation fails**
- Check input validation
- Review error logs
- Verify plan permissions

### Debug Mode
```typescript
// Enable detailed logging
process.env.DEBUG = 'export-bundle:*'
```

## Support

For technical support:
- Check test coverage
- Review error logs
- Verify plan configuration
- Test with minimal data

For business inquiries:
- Plan upgrade options
- Enterprise features
- Custom integrations
- Compliance requirements
