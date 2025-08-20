# Quality Gates: DoR/DoD Validation System

## Overview

The Quality Gates system implements strict **Definition of Ready (DoR)** and **Definition of Done (DoD)** validation to prevent improvisation in PromptForge™. This system acts as a final gate that ensures only validated, high-quality outputs are delivered.

**Key Principle: "Nu improviza" - No improvisation allowed. Any output below quality thresholds → FAIL.**

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Input Data   │───▶│   DoR Gates     │───▶│   Execution    │
│   (7D + Config)│    │   (Pre-flight)  │    │   (Generation) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   DoD Gates     │    │   Export       │
                       │   (Post-flight) │    │   (Delivery)   │
                       └─────────────────┘    └─────────────────┘
```

## Definition of Ready (DoR)

A module/run is **"Ready"** only if ALL conditions are met:

### 1. 7D Validation ✅
- **Rule**: `enum_only: true, raise_on_invalid: true`
- **Check**: All 7D parameters must be valid enum values
- **Failure**: Throws error for any invalid value (no fallbacks)

```typescript
// Must be valid enums from ruleset.yml
domain: 'fintech' | 'ecommerce' | 'education' | ...
scale: 'solo' | 'team' | 'org' | 'market'
urgency: 'low' | 'normal' | 'high' | 'crisis'
complexity: 'low' | 'medium' | 'high'
resources: 'minimal' | 'standard' | 'extended'
application: 'content_ops' | 'sales_ops' | 'research' | ...
output: 'text' | 'sop' | 'plan' | 'bundle'
```

### 2. Entitlements Validation ✅
- **Rule**: User plan must cover requested module/features
- **Pilot Plan**: M01-M10 only, basic exports (txt/md)
- **Pro Plan**: M01-M30, advanced exports (pdf/json)
- **Enterprise Plan**: M01-M50, full features (API, bundle.zip)

### 3. Output Spec Loaded ✅
- **Rule**: Module specification must be available
- **Check**: `module.spec.json.outputs.fields` exists and complete
- **Failure**: Cannot proceed without output contract

### 4. Tests Defined ✅
- **Rule**: At least one test case must be defined
- **Check**: `module.spec.json.tests[]` exists with input + assert
- **Failure**: No execution without test coverage

### 5. Input Minimum ✅
- **Rule**: Content must meet minimum requirements
- **Check**: `inputs.custom` contains required fields + minimum length
- **Failure**: Cannot generate from insufficient input

## Definition of Done (DoD)

A bundle is **"Done"** only if ALL conditions are met:

### 1. Score Threshold (≥80) ✅
- **Rule**: Evaluator score must be ≥80
- **Rubric**: clarity + execution + ambiguity + business_fit
- **Failure**: Below 80 → tighten once, if still <80 → FAIL
- **No Improvisation**: Cannot "create something else" to meet threshold

### 2. Output Complete ✅
- **Rule**: All required output fields populated
- **Check**: `outputs.fields.required=true` → must have value
- **Format**: Must respect `output_spec_contract`
- **Failure**: Missing required sections → cannot deliver

### 3. Checksum Valid ✅
- **Rule**: SHA256 hash verification passed
- **Check**: Files exported match checksum in `export.manifest.json`
- **Failure**: Hash mismatch → bundle integrity compromised

### 4. Manifest Written ✅
- **Rule**: `export.manifest.json` exists and complete
- **Required Fields**:
  ```json
  {
    "project": "string",
    "module": "M##",
    "run_id": "uuid",
    "sevenD": "object",
    "files": "array",
    "score": "number",
    "kpi": "object",
    "license_notice": "string",
    "created_at": "timestamp"
  }
  ```

### 5. Telemetry Saved ✅
- **Rule**: Run data persisted to database
- **Required**: `run_id`, `module_code`, `semver`, `final_7d`, `scores`
- **Security**: No raw client content, only hashes and metrics
- **Failure**: Missing telemetry → cannot track quality

## Implementation

### Core Validators

```typescript
import { 
  DoRValidator, 
  DoDValidator, 
  QualityGateValidator 
} from '@/lib/dor-dod-validator'

// DoR Validation
const dorResult = DoRValidator.validate(prompt, userPlanId)
if (!dorResult.isReady) {
  throw new Error(`DoR failed: ${dorResult.errors.join('; ')}`)
}

// DoD Validation
const dodResult = DoDValidator.validate(prompt, testResults, bundle)
if (!dodResult.isDone) {
  throw new Error(`DoD failed: ${dodResult.errors.join('; ')}`)
}

// Combined Validation
const validation = QualityGateValidator.validateRun(
  prompt, userPlanId, testResults, bundle
)
if (!validation.canDeliver) {
  throw new Error('Quality gates failed - cannot deliver bundle')
}
```

### UI Integration

```typescript
import { QualityGates } from '@/components/quality-gates'

// Component automatically blocks actions when gates fail
<QualityGates
  prompt={currentPrompt}
  testResults={testResults}
  userPlanId={userPlanId}
  onValidationChange={(canProceed, canDeliver) => {
    setCanProceed(canProceed)
    setCanDeliver(canDeliver)
  }}
/>
```

### Export Enforcement

```typescript
// Export Manager blocks export until quality gates pass
const handleExport = () => {
  if (!canDeliver) {
    alert("Quality gates failed. Cannot export without validation.")
    return
  }
  // Proceed with export
}
```

## Error Handling

### DoR Failures
- **Action**: Block execution completely
- **Message**: Clear error listing failed checks
- **Recovery**: Fix validation issues before retry

### DoD Failures
- **Action**: Block bundle delivery
- **Message**: Specific failure reason + required fixes
- **Recovery**: Address quality issues, re-test, re-validate

### No Improvisation Rule
- **Agent Cannot**: "Create something else" to meet thresholds
- **Must**: Fix actual issues or fail gracefully
- **Result**: Consistent quality or clear failure indication

## Testing

### Unit Tests
```bash
# Run quality gate tests
npm test lib/dor-dod-validator.test.ts
```

### Test Coverage
- DoR validation scenarios
- DoD validation scenarios
- Integration workflows
- Error handling
- Edge cases

### Test Data
- Valid prompts with various configurations
- Invalid prompts triggering failures
- Different user plan entitlements
- Bundle validation scenarios

## Configuration

### Ruleset Integration
```yaml
# cursor/docs/ruleset.yml
dor:
  gates:
    - id: seven_d_valid
      rule: "validate(enums=seven_d, enum_only=true, raise_on_invalid=true)"
    - id: entitlements_present
      rule: "check(plan_features>=required_for_request)"
    # ... additional gates

dod:
  gates:
    - id: score_threshold
      rule: "scoring.overall>=80"
    - id: output_complete
      rule: "artifacts.contains_all(export_bundle.artifacts_order)"
    # ... additional gates
```

### Thresholds
- **Score Threshold**: 80 (configurable in ruleset)
- **Input Minimum**: 64 characters
- **Required Artifacts**: txt, md, json, manifest, checksum
- **Plan Restrictions**: Enforced per feature

## Monitoring & Alerts

### Quality Metrics
- **DoR Pass Rate**: % of runs passing pre-flight checks
- **DoD Pass Rate**: % of bundles passing post-flight checks
- **Failure Reasons**: Top causes of gate failures
- **Recovery Time**: Time from failure to resolution

### Alerting
- **Threshold Breaches**: Score <80, missing artifacts
- **Entitlement Violations**: Unauthorized module access
- **Validation Failures**: 7D parameter violations
- **Bundle Issues**: Checksum failures, manifest problems

## Compliance

### Audit Trail
- All validation results logged
- Failed checks recorded with reasons
- User actions tracked for compliance
- Quality metrics for reporting

### Security
- No raw content in telemetry
- Hash-based integrity verification
- Entitlement enforcement at every level
- Audit logging for all operations

## Troubleshooting

### Common DoR Failures
1. **Invalid 7D Parameters**: Check enum values in ruleset.yml
2. **Entitlement Issues**: Verify user plan covers requested features
3. **Missing Specs**: Ensure module.spec.json is complete
4. **Test Coverage**: Define at least one test case

### Common DoD Failures
1. **Low Scores**: Review prompt quality, run tighten iteration
2. **Missing Artifacts**: Verify export bundle completeness
3. **Checksum Issues**: Check file integrity and hash calculation
4. **Manifest Problems**: Ensure all required fields populated

### Recovery Steps
1. **Identify Failure**: Check validation error messages
2. **Fix Root Cause**: Address specific validation issues
3. **Re-validate**: Run quality gates again
4. **Monitor**: Track metrics to prevent recurrence

## Future Enhancements

### Planned Features
- **Auto-fix Suggestions**: AI-powered issue resolution
- **Quality Prediction**: ML-based quality forecasting
- **Dynamic Thresholds**: Adaptive quality requirements
- **Batch Validation**: Bulk quality gate processing

### Integration Points
- **CI/CD Pipeline**: Automated quality enforcement
- **API Gateway**: Quality gate validation for external calls
- **Monitoring Dashboard**: Real-time quality metrics
- **Alert System**: Proactive quality issue notification

---

**Remember: "Nu improviza" - The quality gates are your final defense against improvisation. Respect them, and they will ensure consistent, high-quality delivery.**
