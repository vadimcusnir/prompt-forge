/**
 * lib/dor-dod-validator.test.ts — Tests for DoR/DoD validation system
 * 
 * Ensures strict enforcement of quality gates with no improvisation allowed
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { 
  DoRValidator, 
  DoDValidator, 
  QualityGateValidator,
  type DoRResult,
  type DoDResult,
  type BundleValidation 
} from './dor-dod-validator'
import type { GeneratedPrompt } from '@/types/promptforge'
import type { TestResult } from './test-engine'

// Mock data for testing
const mockPrompt: GeneratedPrompt = {
  id: 'test-123',
  moduleId: 1,
  moduleName: 'Test Module',
  vector: 1,
  content: 'This is a test prompt with sufficient content length to meet minimum requirements',
  config: {
    domain: 'fintech',
    scale: 'team',
    urgency: 'normal',
    complexity: 'medium',
    resources: 'standard',
    application: 'content_ops',
    outputFormat: 'bundle'
  },
  validationScore: 85,
  sessionHash: 'abc123',
  timestamp: new Date(),
  testResults: []
}

const mockTestResults: TestResult[] = [
  {
    id: 'test-1',
    promptId: 'test-123',
    timestamp: new Date(),
    executionTime: 1500,
    output: 'Test output',
    scores: {
      structure: 85,
      kpiCompliance: 88,
      clarity: 82,
      executability: 87,
      overall: 85
    },
    validation: {
      hasRequiredSections: true,
      hasValidKPIs: true,
      hasGuardrails: true,
      hasFailsafes: true,
      isExecutable: true,
      issues: []
    },
    status: 'success',
    recommendations: []
  }
]

const mockBundle: BundleValidation = {
  artifacts: {
    txt: true,
    md: true,
    json: true,
    pdf: false,
    manifest: true,
    checksum: true
  },
  checksum: {
    calculated: 'sha256:abc123...',
    verified: true,
    files: ['prompt.txt', 'prompt.md', 'prompt.json', 'manifest.json']
  },
  manifest: {
    exists: true,
    complete: true,
    licenseNotice: 'PFv3 Pro'
  }
}

describe('DoR Validator', () => {
  describe('validate', () => {
    it('should pass DoR validation for valid prompt', () => {
      const result = DoRValidator.validate(mockPrompt, 'pro')
      
      expect(result.isReady).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.checks.sevenDValid).toBe(true)
      expect(result.checks.entitlementsValid).toBe(true)
      expect(result.checks.outputSpecLoaded).toBe(true)
      expect(result.checks.testsDefined).toBe(false) // No test results in mock
      expect(result.checks.inputMinimum).toBe(true)
    })

    it('should fail DoR validation for pilot plan with module > 10', () => {
      const highModulePrompt = { ...mockPrompt, moduleId: 15 }
      const result = DoRValidator.validate(highModulePrompt, 'pilot')
      
      expect(result.isReady).toBe(false)
      expect(result.errors).toContain('Module 15 requires pro plan or higher')
    })

    it('should fail DoR validation for empty content', () => {
      const emptyPrompt = { ...mockPrompt, content: '' }
      const result = DoRValidator.validate(emptyPrompt, 'pro')
      
      expect(result.isReady).toBe(false)
      expect(result.errors).toContain('Output spec is missing or empty')
    })

    it('should fail DoR validation for content below minimum length', () => {
      const shortPrompt = { ...mockPrompt, content: 'Short' }
      const result = DoRValidator.validate(shortPrompt, 'pro')
      
      expect(result.isReady).toBe(false)
      expect(result.errors).toContain('Input content is below minimum required length (64 characters)')
    })

    it('should fail DoR validation for invalid 7D parameters', () => {
      const invalidPrompt = { 
        ...mockPrompt, 
        config: { ...mockPrompt.config, domain: 'invalid-domain' }
      }
      const result = DoRValidator.validate(invalidPrompt, 'pro')
      
      expect(result.isReady).toBe(false)
      expect(result.errors.some(e => e.includes('7D validation failed'))).toBe(true)
    })
  })
})

describe('DoD Validator', () => {
  describe('validate', () => {
    it('should pass DoD validation for valid bundle', () => {
      const result = DoDValidator.validate(mockPrompt, mockTestResults, mockBundle)
      
      expect(result.isDone).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.finalScore).toBe(85)
      expect(result.checks.scoreThreshold).toBe(true)
      expect(result.checks.outputComplete).toBe(true)
      expect(result.checks.checksumValid).toBe(true)
      expect(result.checks.manifestWritten).toBe(true)
      expect(result.checks.telemetrySaved).toBe(true)
    })

    it('should fail DoD validation for score below 80', () => {
      const lowScoreTest = {
        ...mockTestResults[0],
        scores: { ...mockTestResults[0].scores, overall: 75 }
      }
      const result = DoDValidator.validate(mockPrompt, [lowScoreTest], mockBundle)
      
      expect(result.isDone).toBe(false)
      expect(result.errors).toContain('Score 75 is below threshold 80 - bundle cannot be delivered')
    })

    it('should fail DoD validation for missing artifacts', () => {
      const incompleteBundle = {
        ...mockBundle,
        artifacts: { ...mockBundle.artifacts, json: false }
      }
      const result = DoDValidator.validate(mockPrompt, mockTestResults, incompleteBundle)
      
      expect(result.isDone).toBe(false)
      expect(result.errors).toContain('Required output artifacts are missing')
    })

    it('should fail DoD validation for invalid checksum', () => {
      const invalidChecksumBundle = {
        ...mockBundle,
        checksum: { ...mockBundle.checksum, verified: false }
      }
      const result = DoDValidator.validate(mockPrompt, mockTestResults, invalidChecksumBundle)
      
      expect(result.isDone).toBe(false)
      expect(result.errors).toContain('Bundle checksum validation failed')
    })

    it('should fail DoD validation for missing manifest', () => {
      const noManifestBundle = {
        ...mockBundle,
        manifest: { ...mockBundle.manifest, exists: false }
      }
      const result = DoDValidator.validate(mockPrompt, mockTestResults, noManifestBundle)
      
      expect(result.isDone).toBe(false)
      expect(result.errors).toContain('Export manifest is missing or incomplete')
    })

    it('should fail DoD validation for missing telemetry', () => {
      const noTelemetryPrompt = { ...mockPrompt, sessionHash: undefined }
      const result = DoDValidator.validate(noTelemetryPrompt, mockTestResults, mockBundle)
      
      expect(result.isDone).toBe(false)
      expect(result.errors).toContain('Telemetry data is missing')
    })
  })

  describe('validateBundle', () => {
    it('should validate bundle structure correctly', () => {
      const validatedBundle = DoDValidator.validateBundle(mockBundle)
      
      expect(validatedBundle.checksum.verified).toBe(true)
      expect(validatedBundle.manifest.complete).toBe(true)
    })
  })
})

describe('Quality Gate Validator', () => {
  describe('validateRun', () => {
    it('should pass both DoR and DoD validation', () => {
      const promptWithTests = { ...mockPrompt, testResults: mockTestResults }
      const result = QualityGateValidator.validateRun(promptWithTests, 'pro', mockTestResults, mockBundle)
      
      expect(result.overallPass).toBe(true)
      expect(result.canProceed).toBe(true)
      expect(result.canDeliver).toBe(true)
      expect(result.dor.isReady).toBe(true)
      expect(result.dod.isDone).toBe(true)
    })

    it('should fail DoR validation and block DoD evaluation', () => {
      const invalidPrompt = { ...mockPrompt, content: '' }
      const result = QualityGateValidator.validateRun(invalidPrompt, 'pro', mockTestResults, mockBundle)
      
      expect(result.overallPass).toBe(false)
      expect(result.canProceed).toBe(false)
      expect(result.canDeliver).toBe(false)
      expect(result.dor.isReady).toBe(false)
      expect(result.dod.errors).toContain('DoR validation failed - DoD cannot be evaluated')
    })

    it('should pass DoR but fail DoD validation', () => {
      const promptWithTests = { ...mockPrompt, testResults: mockTestResults }
      const lowScoreTest = {
        ...mockTestResults[0],
        scores: { ...mockTestResults[0].scores, overall: 75 }
      }
      const result = QualityGateValidator.validateRun(promptWithTests, 'pro', [lowScoreTest], mockBundle)
      
      expect(result.overallPass).toBe(false)
      expect(result.canProceed).toBe(true)
      expect(result.canDeliver).toBe(false)
      expect(result.dor.isReady).toBe(true)
      expect(result.dod.isDone).toBe(false)
    })
  })

  describe('enforceQualityGates', () => {
    it('should not throw error for valid run', () => {
      const promptWithTests = { ...mockPrompt, testResults: mockTestResults }
      
      expect(() => {
        QualityGateValidator.enforceQualityGates(promptWithTests, 'pro', mockTestResults, mockBundle)
      }).not.toThrow()
    })

    it('should throw error for DoR failure', () => {
      const invalidPrompt = { ...mockPrompt, content: '' }
      
      expect(() => {
        QualityGateValidator.enforceQualityGates(invalidPrompt, 'pro', mockTestResults, mockBundle)
      }).toThrow('DoR validation failed')
    })

    it('should throw error for DoD failure', () => {
      const promptWithTests = { ...mockPrompt, testResults: mockTestResults }
      const lowScoreTest = {
        ...mockTestResults[0],
        scores: { ...mockTestResults[0].scores, overall: 75 }
      }
      
      expect(() => {
        QualityGateValidator.enforceQualityGates(promptWithTests, 'pro', [lowScoreTest], mockBundle)
      }).toThrow('DoD validation failed')
    })
  })
})

describe('Integration Tests', () => {
  it('should enforce complete quality gate workflow', () => {
    // Test complete workflow from DoR to DoD
    const promptWithTests = { ...mockPrompt, testResults: mockTestResults }
    
    // Step 1: DoR validation
    const dorResult = DoRValidator.validate(promptWithTests, 'pro')
    expect(dorResult.isReady).toBe(true)
    
    // Step 2: DoD validation (only if DoR passes)
    if (dorResult.isReady) {
      const dodResult = DoDValidator.validate(promptWithTests, mockTestResults, mockBundle)
      expect(dodResult.isDone).toBe(true)
      
      // Step 3: Final quality gate check
      const finalValidation = QualityGateValidator.validateRun(promptWithTests, 'pro', mockTestResults, mockBundle)
      expect(finalValidation.overallPass).toBe(true)
    }
  })

  it('should block delivery for any quality gate failure', () => {
    const testCases = [
      {
        name: 'Invalid 7D',
        prompt: { ...mockPrompt, config: { ...mockPrompt.config, domain: 'invalid' } },
        expectedBlock: true
      },
      {
        name: 'Low score',
        prompt: mockPrompt,
        testResults: [{ ...mockTestResults[0], scores: { ...mockTestResults[0].scores, overall: 75 } }],
        expectedBlock: true
      },
      {
        name: 'Missing artifacts',
        prompt: mockPrompt,
        testResults: mockTestResults,
        bundle: { ...mockBundle, artifacts: { ...mockBundle.artifacts, json: false } },
        expectedBlock: true
      }
    ]

    testCases.forEach(({ name, prompt, testResults, bundle }) => {
      const result = QualityGateValidator.validateRun(
        prompt, 
        'pro', 
        testResults || mockTestResults, 
        bundle || mockBundle
      )
      
      expect(result.canDeliver).toBe(false)
      expect(result.overallPass).toBe(false)
    })
  })
})
