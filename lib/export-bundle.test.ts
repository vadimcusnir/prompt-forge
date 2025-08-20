/**
 * lib/export-bundle.test.ts — Export Bundle System Tests
 * 
 * Tests artifact generation, plan gating, and bundle creation
 */

import { ExportBundleManager, type ExportBundle, type ExportConfig } from './export-bundle'
import { PLANS } from './entitlements/types'
import type { GeneratedPrompt } from '@/types/promptforge'
import type { TestResult } from './test-engine'
import type { GPTEditResult } from './gpt-editor'

// Mock data for testing
const mockPrompt: GeneratedPrompt = {
  id: 'test-123',
  hash: 'abc123def456',
  timestamp: new Date('2024-01-01T00:00:00Z'),
  config: {
    vector: 'V1',
    domain: 'saas',
    scale: 'startup',
    urgency: 'sprint',
    resources: 'lean_team',
    complexity: 'standard',
    application: 'implementation',
    outputFormat: 'txt'
  },
  moduleId: 1,
  prompt: 'This is a test prompt for the export bundle system.',
  editedPrompt: 'This is an edited test prompt for the export bundle system.',
  testResults: {
    structureScore: 85,
    kpiScore: 90,
    clarityScore: 88,
    output: 'Test output',
    validated: true
  }
}

const mockTestResults: TestResult[] = [
  {
    testName: 'Structure Test',
    passed: true,
    score: 85,
    details: 'Prompt structure is well-formed',
    timestamp: new Date()
  },
  {
    testName: 'KPI Test',
    passed: true,
    score: 90,
    details: 'All KPI requirements met',
    timestamp: new Date()
  }
]

const mockEditResults: GPTEditResult[] = [
  {
    editType: 'Clarity Improvement',
    confidence: 95.5,
    changes: 'Enhanced sentence structure for better clarity',
    timestamp: new Date()
  }
]

describe('ExportBundleManager', () => {
  describe('Plan-based gating', () => {
    test('Free plan should only allow txt export', () => {
      const formats = ExportBundleManager.getAvailableFormats('free')
      expect(formats).toEqual(['txt'])
    })

    test('Creator plan should allow txt and md export', () => {
      const formats = ExportBundleManager.getAvailableFormats('creator')
      expect(formats).toEqual(['txt', 'md'])
    })

    test('Pro plan should allow txt, md, json, and pdf export', () => {
      const formats = ExportBundleManager.getAvailableFormats('pro')
      expect(formats).toEqual(['txt', 'md', 'json', 'pdf'])
    })

    test('Enterprise plan should allow all formats including bundle', () => {
      const formats = ExportBundleManager.getAvailableFormats('enterprise')
      expect(formats).toEqual(['txt', 'md', 'json', 'pdf', 'bundle'])
    })

    test('Invalid plan should fallback to txt only', () => {
      const formats = ExportBundleManager.getAvailableFormats('invalid')
      expect(formats).toEqual(['txt'])
    })
  })

  describe('Export permissions validation', () => {
    test('Free plan should validate txt export', () => {
      const allowed = ExportBundleManager.validateExportPermissions('free', ['txt'])
      expect(allowed).toBe(true)
    })

    test('Free plan should reject md export', () => {
      const allowed = ExportBundleManager.validateExportPermissions('free', ['md'])
      expect(allowed).toBe(false)
    })

    test('Creator plan should validate txt and md export', () => {
      const allowed = ExportBundleManager.validateExportPermissions('creator', ['txt', 'md'])
      expect(allowed).toBe(true)
    })

    test('Creator plan should reject pdf export', () => {
      const allowed = ExportBundleManager.validateExportPermissions('creator', ['pdf'])
      expect(allowed).toBe(false)
    })

    test('Pro plan should validate all basic formats', () => {
      const allowed = ExportBundleManager.validateExportPermissions('pro', ['txt', 'md', 'json', 'pdf'])
      expect(allowed).toBe(true)
    })

    test('Enterprise plan should validate all formats including bundle', () => {
      const allowed = ExportBundleManager.validateExportPermissions('enterprise', ['txt', 'md', 'json', 'pdf', 'bundle'])
      expect(allowed).toBe(true)
    })
  })

  describe('Bundle generation', () => {
    test('Should generate bundle for free plan', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'free'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      
      expect(bundle).toBeDefined()
      expect(bundle.artifacts).toHaveLength(4) // txt, telemetry, manifest, checksum
      expect(bundle.checksum).toBeDefined()
      expect(bundle.manifest).toBeDefined()
      
      // Should only contain txt artifact for free plan
      const txtArtifact = bundle.artifacts.find(a => a.filename === 'prompt.txt')
      expect(txtArtifact).toBeDefined()
      
      // Should not contain md, json, or pdf for free plan
      const mdArtifact = bundle.artifacts.find(a => a.filename === 'prompt.md')
      expect(mdArtifact).toBeUndefined()
    })

    test('Should generate bundle for creator plan', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'creator'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      
      expect(bundle).toBeDefined()
      expect(bundle.artifacts).toHaveLength(5) // txt, md, telemetry, manifest, checksum
      
      // Should contain txt and md artifacts
      const txtArtifact = bundle.artifacts.find(a => a.filename === 'prompt.txt')
      const mdArtifact = bundle.artifacts.find(a => a.filename === 'prompt.md')
      expect(txtArtifact).toBeDefined()
      expect(mdArtifact).toBeDefined()
      
      // Should not contain json or pdf for creator plan
      const jsonArtifact = bundle.artifacts.find(a => a.filename === 'prompt.json')
      expect(jsonArtifact).toBeUndefined()
    })

    test('Should generate bundle for pro plan', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'pro'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      
      expect(bundle).toBeDefined()
      expect(bundle.artifacts).toHaveLength(7) // txt, md, json, pdf, telemetry, manifest, checksum
      
      // Should contain all basic formats
      const txtArtifact = bundle.artifacts.find(a => a.filename === 'prompt.txt')
      const mdArtifact = bundle.artifacts.find(a => a.filename === 'prompt.md')
      const jsonArtifact = bundle.artifacts.find(a => a.filename === 'prompt.json')
      const pdfArtifact = bundle.artifacts.find(a => a.filename === 'prompt.pdf')
      
      expect(txtArtifact).toBeDefined()
      expect(mdArtifact).toBeDefined()
      expect(jsonArtifact).toBeDefined()
      expect(pdfArtifact).toBeDefined()
    })

    test('Should generate bundle for enterprise plan', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'enterprise'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      
      expect(bundle).toBeDefined()
      expect(bundle.artifacts).toHaveLength(7) // txt, md, json, pdf, telemetry, manifest, checksum
      expect(bundle.zipBuffer).toBeDefined() // Enterprise gets ZIP bundle
      
      // Should contain all formats
      const txtArtifact = bundle.artifacts.find(a => a.filename === 'prompt.txt')
      const mdArtifact = bundle.artifacts.find(a => a.filename === 'prompt.md')
      const jsonArtifact = bundle.artifacts.find(a => a.filename === 'prompt.json')
      const pdfArtifact = bundle.artifacts.find(a => a.filename === 'prompt.pdf')
      
      expect(txtArtifact).toBeDefined()
      expect(mdArtifact).toBeDefined()
      expect(jsonArtifact).toBeDefined()
      expect(pdfArtifact).toBeDefined()
    })
  })

  describe('Artifact content validation', () => {
    test('TXT artifact should contain prompt content and metadata', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'free'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      const txtArtifact = bundle.artifacts.find(a => a.filename === 'prompt.txt')
      
      expect(txtArtifact).toBeDefined()
      expect(txtArtifact!.content).toContain('PROMPTFORGE™ v3.0.0')
      expect(txtArtifact!.content).toContain('Module: 1')
      expect(txtArtifact!.content).toContain('Vector: V1')
      expect(txtArtifact!.content).toContain('This is a test prompt')
      expect(txtArtifact!.content).toContain('LICENSE NOTICE')
    })

    test('MD artifact should contain formatted markdown', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'creator'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      const mdArtifact = bundle.artifacts.find(a => a.filename === 'prompt.md')
      
      expect(mdArtifact).toBeDefined()
      expect(mdArtifact!.content).toContain('# PROMPTFORGE™ v3.0.0')
      expect(mdArtifact!.content).toContain('## Prompt Specification')
      expect(mdArtifact!.content).toContain('| Field | Value |')
      expect(mdArtifact!.content).toContain('**Vector:** V1')
    })

    test('JSON artifact should contain structured data', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'pro'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      const jsonArtifact = bundle.artifacts.find(a => a.filename === 'prompt.json')
      
      expect(jsonArtifact).toBeDefined()
      const jsonContent = JSON.parse(jsonArtifact!.content as string)
      
      expect(jsonContent.metadata.product).toBe('PROMPTFORGE™')
      expect(jsonContent.prompt.module).toBe(1)
      expect(jsonContent.prompt.vector).toBe('V1')
      expect(jsonContent.prompt.content).toBe('This is a test prompt for the export bundle system.')
    })

    test('Manifest should contain bundle metadata', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'free'
      }

      const bundle = await ExportBundleManager.generateBundle(config)
      const manifestArtifact = bundle.artifacts.find(a => a.filename === 'manifest.json')
      
      expect(manifestArtifact).toBeDefined()
      const manifest = JSON.parse(manifestArtifact!.content as string)
      
      expect(manifest.project).toBe('PROMPTFORGE_v3')
      expect(manifest.module).toBe('1')
      expect(manifest.run_id).toBe('abc123def456')
      expect(manifest.branding.product).toBe('PROMPTFORGE™')
      expect(manifest.plan_restrictions.user_plan).toBe('free')
    })

    test('Checksum should be consistent', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'free'
      }

      const bundle1 = await ExportBundleManager.generateBundle(config)
      const bundle2 = await ExportBundleManager.generateBundle(config)
      
      // Same input should produce same checksum
      expect(bundle1.checksum).toBe(bundle2.checksum)
      expect(bundle1.checksum).toHaveLength(64) // SHA-256 hex string
    })
  })

  describe('Error handling', () => {
    test('Should throw error for invalid plan', async () => {
      const config: ExportConfig = {
        prompt: mockPrompt,
        testResults: mockTestResults,
        editResults: mockEditResults,
        userPlan: 'invalid_plan'
      }

      await expect(ExportBundleManager.generateBundle(config)).rejects.toThrow('Invalid plan: invalid_plan')
    })
  })
})

// Mock crypto module for testing
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mocked-checksum-1234567890abcdef')
  }))
}))
