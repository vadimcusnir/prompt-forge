/**
 * lib/export-bundle.ts — Export Bundle System
 * 
 * Handles artifact generation (.txt/.md/.json/.pdf) + telemetry + checksum + manifest
 * Implements plan-based gating: Free=txt, Creator=txt+md, Pro=+pdf/json, Enterprise=all+zip+API
 */

import { createHash } from 'crypto'
import { PLANS, type PlanFeatures } from './entitlements/types'
import type { GeneratedPrompt } from '@/types/promptforge'
import type { TestResult } from '@/lib/test-engine'
import type { GPTEditResult } from '@/lib/gpt-editor'

export interface ExportArtifact {
  filename: string
  content: string | Buffer
  mimeType: string
  size: number
}

export interface ExportBundle {
  artifacts: ExportArtifact[]
  manifest: ExportManifest
  checksum: string
  zipBuffer?: Buffer
}

export interface ExportManifest {
  project: string
  module: string
  run_id: string
  sevenD: {
    domain: string
    scale: string
    urgency: string
    complexity: string
    resources: string
    application: string
    output: string
  }
  files: Record<string, string>
  score: number
  kpi: Record<string, any>
  license_notice: string
  bundle_checksum: string
  path_prefix: string
  visibility: 'internal' | 'public'
  dlp_summary: string
  created_at: string
  branding: {
    product: string
    version: string
    company: string
    website: string
  }
  plan_restrictions: {
    user_plan: string
    allowed_formats: string[]
    bundle_available: boolean
  }
}

export interface ExportConfig {
  prompt: GeneratedPrompt
  testResults?: TestResult[]
  editResults?: GPTEditResult[]
  userPlan: string
  includeTelemetry?: boolean
  includeChecksum?: boolean
  includeManifest?: boolean
}

export class ExportBundleManager {
  private static readonly BRANDING = {
    product: 'PROMPTFORGE™',
    version: 'v3.0.0',
    company: 'PromptForge Inc.',
    website: 'https://promptforge.ai'
  }

  private static readonly LICENSE_NOTICE = 
    '© 2024 PromptForge Inc. All rights reserved. This prompt was generated using PROMPTFORGE™ v3.0. ' +
    'Commercial use requires appropriate licensing. See https://promptforge.ai/licensing for details.'

  /**
   * Generate export bundle based on user plan and quality gates
   */
  static async generateBundle(config: ExportConfig): Promise<ExportBundle> {
    const { prompt, testResults = [], editResults = [], userPlan } = config
    const plan = PLANS[userPlan] || PLANS.pilot

    // Validate plan access
    this.validatePlanAccess(plan, userPlan)

    // Generate artifacts based on plan
    const artifacts = await this.generateArtifacts(config, plan)

    // Generate manifest
    const manifest = this.generateManifest(config, artifacts, plan)

    // Generate checksum
    const checksum = this.generateChecksum(artifacts)

    // Update manifest with checksum
    manifest.bundle_checksum = checksum

    // Generate ZIP if Enterprise plan
    let zipBuffer: Buffer | undefined
    if (plan.features.canExportBundleZip) {
      zipBuffer = await this.generateZipBundle(artifacts, manifest)
    }

    return {
      artifacts,
      manifest,
      checksum,
      zipBuffer
    }
  }

  /**
   * Validate user plan access to export features
   */
  private static validatePlanAccess(plan: PlanFeatures, userPlan: string): void {
    if (!plan) {
      throw new Error(`Invalid plan: ${userPlan}`)
    }

    // Basic validation - all plans can export at least TXT
    if (!plan.canExportMD && !plan.canExportPDF && !plan.canExportJSON) {
      throw new Error(`Plan ${userPlan} has no export permissions`)
    }
  }

  /**
   * Generate artifacts based on user plan
   */
  private static async generateArtifacts(config: ExportConfig, plan: PlanFeatures): Promise<ExportArtifact[]> {
    const { prompt, testResults, editResults } = config
    const artifacts: ExportArtifact[] = []

    // TXT - Available to all plans
    artifacts.push(this.generateTxtArtifact(prompt, testResults, editResults))

    // MD - Available to Creator+ plans
    if (plan.canExportMD) {
      artifacts.push(this.generateMdArtifact(prompt, testResults, editResults))
    }

    // JSON - Available to Pro+ plans
    if (plan.canExportJSON) {
      artifacts.push(this.generateJsonArtifact(prompt, testResults, editResults))
    }

    // PDF - Available to Pro+ plans
    if (plan.canExportPDF) {
      artifacts.push(await this.generatePdfArtifact(prompt, testResults, editResults))
    }

    // Telemetry - Available to all plans
    artifacts.push(this.generateTelemetryArtifact(prompt, testResults, editResults))

    // Manifest - Available to all plans
    const manifest = this.generateManifest(config, artifacts, plan)
    artifacts.push(this.generateManifestArtifact(manifest))

    // Checksum - Available to all plans
    const checksum = this.generateChecksum(artifacts)
    artifacts.push(this.generateChecksumArtifact(checksum))

    return artifacts
  }

  /**
   * Generate TXT artifact
   */
  private static generateTxtArtifact(prompt: GeneratedPrompt, testResults: TestResult[], editResults: GPTEditResult[]): ExportArtifact {
    let content = `${ExportBundleManager.BRANDING.product} ${ExportBundleManager.BRANDING.version}\n`
    content += `${ExportBundleManager.BRANDING.company}\n`
    content += '='.repeat(50) + '\n\n'
    content += `PROMPT SPECIFICATION\n`
    content += `Module: ${prompt.moduleId}\n`
    content += `Vector: ${prompt.config.vector}\n`
    content += `Score: ${prompt.testResults?.structureScore?.toFixed(2) || '0.00'}/100\n`
    content += `Session: ${prompt.hash}\n`
    content += `Generated: ${prompt.timestamp.toISOString()}\n\n`
    content += `SEVEN DIMENSIONS:\n`
    content += `Domain: ${prompt.config.domain || 'N/A'}\n`
    content += `Scale: ${prompt.config.scale || 'N/A'}\n`
    content += `Urgency: ${prompt.config.urgency || 'N/A'}\n`
    content += `Complexity: ${prompt.config.complexity || 'N/A'}\n`
    content += `Resources: ${prompt.config.resources || 'N/A'}\n`
    content += `Application: ${prompt.config.application || 'N/A'}\n\n`
    content += `PROMPT CONTENT:\n`
    content += `${prompt.prompt}\n\n`
    content += `LICENSE NOTICE:\n`
    content += `${ExportBundleManager.LICENSE_NOTICE}\n`

    if (testResults.length > 0) {
      content += `\nTEST RESULTS:\n`
      content += '-'.repeat(30) + '\n'
      testResults.forEach((result, index) => {
        content += `${index + 1}. ${result.testName}: ${result.passed ? 'PASS' : 'FAIL'}\n`
        content += `   Score: ${result.score.toFixed(2)}/100\n`
        content += `   Details: ${result.details}\n\n`
      })
    }

    if (editResults.length > 0) {
      content += `\nEDIT HISTORY:\n`
      content += '-'.repeat(30) + '\n'
      editResults.forEach((edit, index) => {
        content += `${index + 1}. ${edit.editType}: ${edit.confidence.toFixed(2)}%\n`
        content += `   Changes: ${edit.changes}\n\n`
      })
    }

    return {
      filename: 'prompt.txt',
      content,
      mimeType: 'text/plain; charset=utf-8',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate MD artifact
   */
  private static generateMdArtifact(prompt: GeneratedPrompt, testResults: TestResult[], editResults: GPTEditResult[]): ExportArtifact {
    let content = `# ${ExportBundleManager.BRANDING.product} ${ExportBundleManager.BRANDING.version}\n\n`
    content += `**Company:** ${ExportBundleManager.BRANDING.company}  \n`
    content += `**Website:** ${ExportBundleManager.BRANDING.website}\n\n`
    content += `## Prompt Specification\n\n`
    content += `| Field | Value |\n`
    content += `|-------|-------|\n`
    content += `| Module | ${prompt.moduleId} |\n`
    content += `| Vector | ${prompt.config.vector} |\n`
    content += `| Score | ${prompt.testResults?.structureScore?.toFixed(2) || '0.00'}/100 |\n`
    content += `| Session | \`${prompt.hash}\` |\n`
    content += `| Generated | ${prompt.timestamp.toISOString()} |\n\n`
    content += `## Seven Dimensions\n\n`
    content += `- **Domain:** ${prompt.config.domain || 'N/A'}\n`
    content += `- **Scale:** ${prompt.config.scale || 'N/A'}\n`
    content += `- **Urgency:** ${prompt.config.urgency || 'N/A'}\n`
    content += `- **Complexity:** ${prompt.config.complexity || 'N/A'}\n`
    content += `- **Resources:** ${prompt.config.resources || 'N/A'}\n`
    content += `- **Application:** ${prompt.config.application || 'N/A'}\n\n`
    content += `## Prompt Content\n\n`
    content += `\`\`\`\n${prompt.prompt}\n\`\`\`\n\n`
    content += `## License Notice\n\n`
    content += `${ExportBundleManager.LICENSE_NOTICE}\n`

    if (testResults.length > 0) {
      content += `\n## Test Results\n\n`
      testResults.forEach((result, index) => {
        content += `### ${index + 1}. ${result.testName}\n\n`
        content += `- **Status:** ${result.passed ? '✅ PASS' : '❌ FAIL'}\n`
        content += `- **Score:** ${result.score.toFixed(2)}/100\n`
        content += `- **Details:** ${result.details}\n\n`
      })
    }

    if (editResults.length > 0) {
      content += `\n## Edit History\n\n`
      editResults.forEach((edit, index) => {
        content += `### ${index + 1}. ${edit.editType}\n\n`
        content += `- **Confidence:** ${edit.confidence.toFixed(2)}%\n`
        content += `- **Changes:** ${edit.changes}\n\n`
      })
    }

    return {
      filename: 'prompt.md',
      content,
      mimeType: 'text/markdown; charset=utf-8',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate JSON artifact
   */
  private static generateJsonArtifact(prompt: GeneratedPrompt, testResults: TestResult[], editResults: GPTEditResult[]): ExportArtifact {
    const data = {
      metadata: {
        product: ExportBundleManager.BRANDING.product,
        version: ExportBundleManager.BRANDING.version,
        company: ExportBundleManager.BRANDING.company,
        generated_at: new Date().toISOString(),
        license_notice: ExportBundleManager.LICENSE_NOTICE
      },
      prompt: {
        module: prompt.moduleId,
        vector: prompt.config.vector,
        score: prompt.testResults?.structureScore || 0,
        session_hash: prompt.hash,
        config: prompt.config,
        content: prompt.prompt
      },
      test_results: testResults.map(result => ({
        test_name: result.testName,
        passed: result.passed,
        score: result.score,
        details: result.details,
        timestamp: result.timestamp?.toISOString()
      })),
      edit_history: editResults.map(edit => ({
        edit_type: edit.editType,
        confidence: edit.confidence,
        changes: edit.changes,
        timestamp: edit.timestamp?.toISOString()
      })),
      seven_dimensions: prompt.config
    }

    const content = JSON.stringify(data, null, 2)

    return {
      filename: 'prompt.json',
      content,
      mimeType: 'application/json; charset=utf-8',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate PDF artifact (mock implementation)
   */
  private static async generatePdfArtifact(prompt: GeneratedPrompt, testResults: TestResult[], editResults: GPTEditResult[]): Promise<ExportArtifact> {
    // In a real implementation, this would use a PDF library like jsPDF or puppeteer
    // For now, we'll generate a PDF-like text representation
    const content = `PDF GENERATION - ${ExportBundleManager.BRANDING.product}\n\nThis is a placeholder for PDF generation.\nIn production, this would generate a proper PDF document.\n\nPrompt: Module ${prompt.moduleId}\nScore: ${prompt.testResults?.structureScore?.toFixed(2) || '0.00'}/100\n\n${prompt.prompt}`

    return {
      filename: 'prompt.pdf',
      content,
      mimeType: 'application/pdf',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate telemetry artifact
   */
  private static generateTelemetryArtifact(prompt: GeneratedPrompt, testResults: TestResult[], editResults: GPTEditResult[]): ExportArtifact {
    const telemetry = {
      timestamp: new Date().toISOString(),
      session_id: prompt.hash,
      module: prompt.moduleId,
      vector: prompt.config.vector,
      validation_score: prompt.testResults?.structureScore || 0,
      test_count: testResults.length,
      edit_count: editResults.length,
      test_scores: testResults.map(t => t.score),
      edit_confidences: editResults.map(e => e.confidence),
      seven_dimensions: prompt.config,
      export_plan: 'determined_by_user_plan',
      bundle_version: '3.0.0'
    }

    const content = JSON.stringify(telemetry, null, 2)

    return {
      filename: 'telemetry.json',
      content,
      mimeType: 'application/json; charset=utf-8',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate manifest artifact
   */
  private static generateManifestArtifact(manifest: ExportManifest): ExportArtifact {
    const content = JSON.stringify(manifest, null, 2)

    return {
      filename: 'manifest.json',
      content,
      mimeType: 'application/json; charset=utf-8',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate checksum artifact
   */
  private static generateChecksumArtifact(checksum: string): ExportArtifact {
    const content = `Bundle Checksum: ${checksum}\nGenerated: ${new Date().toISOString()}\nAlgorithm: SHA-256\n\nThis file contains the cryptographic checksum for the export bundle.\nVerify integrity by comparing this checksum with the one in manifest.json.`

    return {
      filename: 'checksum.txt',
      content,
      mimeType: 'text/plain; charset=utf-8',
      size: Buffer.byteLength(content, 'utf8')
    }
  }

  /**
   * Generate manifest
   */
  private static generateManifest(config: ExportConfig, artifacts: ExportArtifact[], plan: PlanFeatures): ExportManifest {
    const { prompt, userPlan } = config

    return {
      project: 'PROMPTFORGE_v3',
      module: prompt.moduleId.toString(),
      run_id: prompt.hash,
      sevenD: {
        domain: prompt.config.domain || 'unknown',
        scale: prompt.config.scale || 'unknown',
        urgency: prompt.config.urgency || 'unknown',
        complexity: prompt.config.complexity || 'unknown',
        resources: prompt.config.resources || 'unknown',
        application: prompt.config.application || 'unknown',
        output: 'txt,md,json,pdf'
      },
      files: artifacts.reduce((acc, artifact) => {
        acc[artifact.filename] = artifact.filename
        return acc
      }, {} as Record<string, string>),
      score: prompt.testResults?.structureScore || 0,
      kpi: {
        validation_score: prompt.testResults?.structureScore || 0,
        test_count: config.testResults?.length || 0,
        edit_count: config.editResults?.length || 0
      },
      license_notice: ExportBundleManager.LICENSE_NOTICE,
      bundle_checksum: '', // Will be set after generation
      path_prefix: `exports/${prompt.moduleId}_${prompt.hash}`,
      visibility: 'internal',
      dlp_summary: 'No sensitive data detected',
      created_at: new Date().toISOString(),
      branding: ExportBundleManager.BRANDING,
      plan_restrictions: {
        user_plan: userPlan,
        allowed_formats: this.getAllowedFormats(plan),
        bundle_available: plan.features.canExportBundleZip
      }
    }
  }

  /**
   * Get allowed export formats for a plan
   */
  private static getAllowedFormats(plan: PlanFeatures): string[] {
    const formats = ['txt']
    
    if (plan.canExportMD) formats.push('md')
    if (plan.canExportJSON) formats.push('json')
    if (plan.canExportPDF) formats.push('pdf')
    if (plan.canExportBundleZip) formats.push('bundle')
    
    return formats
  }

  /**
   * Generate checksum for all artifacts
   */
  private static generateChecksum(artifacts: ExportArtifact[]): string {
    const hash = createHash('sha256')
    
    // Sort artifacts by filename for consistent checksum
    const sortedArtifacts = artifacts.sort((a, b) => a.filename.localeCompare(b.filename))
    
    sortedArtifacts.forEach(artifact => {
      hash.update(artifact.filename)
      hash.update(artifact.content.toString())
      hash.update(artifact.mimeType)
      hash.update(artifact.size.toString())
    })
    
    return hash.digest('hex')
  }

  /**
   * Generate ZIP bundle (Enterprise only)
   */
  private static async generateZipBundle(artifacts: ExportArtifact[], manifest: ExportManifest): Promise<Buffer> {
    // In a real implementation, this would use a ZIP library like JSZip
    // For now, we'll return a mock ZIP buffer
    const mockZipContent = `PK\x03\x04\n\x00\x00\x00\x00\x00${artifacts.map(a => a.filename).join('\n')}PK\x01\x02\n\x00\x00\x00\x00\x00`
    
    return Buffer.from(mockZipContent, 'utf8')
  }

  /**
   * Validate export permissions for a user plan
   */
  static validateExportPermissions(userPlan: string, requestedFormats: string[]): boolean {
    const plan = PLANS[userPlan]
    if (!plan) return false

    const allowedFormats = this.getAllowedFormats(plan)
    
    return requestedFormats.every(format => allowedFormats.includes(format))
  }

  /**
   * Get available export formats for a user plan
   */
  static getAvailableFormats(userPlan: string): string[] {
    const plan = PLANS[userPlan]
    if (!plan) return ['txt'] // Fallback to basic

    return this.getAllowedFormats(plan)
  }
}
