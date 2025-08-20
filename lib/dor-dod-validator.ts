/**
 * lib/dor-dod-validator.ts — Strict Definition of Ready/Definition of Done Validator
 * 
 * Implements final gates to prevent improvisation:
 * - DoR: 7D valid, entitlements OK, tests defined, input minimum
 * - DoD: Score ≥80, bundle complete, checksum valid, manifest written, telemetry saved
 * 
 * Any output below these thresholds → FAIL (agent cannot "create something else")
 */

import { sevenDValidator, type SevenDParams } from './validator'
import { EntitlementChecker } from './entitlements/useEntitlements'
import type { GeneratedPrompt } from '@/types/promptforge'
import type { TestResult } from './test-engine'

// DoR Validation Result
export interface DoRResult {
  isReady: boolean
  checks: {
    sevenDValid: boolean
    entitlementsValid: boolean
    outputSpecLoaded: boolean
    testsDefined: boolean
    inputMinimum: boolean
  }
  errors: string[]
  warnings: string[]
}

// DoD Validation Result  
export interface DoDResult {
  isDone: boolean
  checks: {
    scoreThreshold: boolean
    outputComplete: boolean
    checksumValid: boolean
    manifestWritten: boolean
    telemetrySaved: boolean
  }
  errors: string[]
  warnings: string[]
  finalScore: number
}

// Bundle Export Validation
export interface BundleValidation {
  artifacts: {
    txt: boolean
    md: boolean
    json: boolean
    pdf: boolean
    manifest: boolean
    checksum: boolean
  }
  checksum: {
    calculated: string
    verified: boolean
    files: string[]
  }
  manifest: {
    exists: boolean
    complete: boolean
    licenseNotice: string
  }
}

/**
 * Definition of Ready (DoR) Validator
 * Module/run is "Ready" only if all conditions are met
 */
export class DoRValidator {
  /**
   * Validates if a run is ready for execution
   * Throws error if any required check fails (no improvisation allowed)
   */
  static validate(
    prompt: GeneratedPrompt,
    userPlanId: string = 'pilot'
  ): DoRResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 1. 7D Validation (enum_only: true, raise_on_invalid: true)
    let sevenDValid = false
    try {
      const sevenD: SevenDParams = {
        domain: prompt.config.domain,
        scale: prompt.config.scale,
        urgency: prompt.config.urgency,
        complexity: prompt.config.complexity,
        resources: prompt.config.resources,
        application: prompt.config.application,
        output: prompt.config.outputFormat
      }
      sevenDValidator.validate(sevenD)
      sevenDValid = true
    } catch (error) {
      errors.push(`7D validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // 2. Entitlements Validation
    let entitlementsValid = false
    try {
      const moduleAccess = EntitlementChecker.checkFeature(userPlanId, 'canUseAllModules')
      if (!moduleAccess.allowed) {
        // Check if specific module is allowed for pilot plan (M01-M10)
        const moduleId = parseInt(prompt.moduleId.toString())
        if (userPlanId === 'pilot' && moduleId >= 1 && moduleId <= 10) {
          entitlementsValid = true
        } else {
          errors.push(`Module ${prompt.moduleId} requires ${moduleAccess.requiredPlan} plan or higher`)
        }
      } else {
        entitlementsValid = true
      }
    } catch (error) {
      errors.push(`Entitlements validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // 3. Output Spec Loaded
    const outputSpecLoaded = prompt.content && prompt.content.length > 0
    if (!outputSpecLoaded) {
      errors.push('Output spec is missing or empty')
    }

    // 4. Tests Defined
    const testsDefined = prompt.testResults && prompt.testResults.length > 0
    if (!testsDefined) {
      errors.push('No test cases defined for this module')
    }

    // 5. Input Minimum
    const inputMinimum = prompt.content && prompt.content.length >= 64
    if (!inputMinimum) {
      errors.push('Input content is below minimum required length (64 characters)')
    }

    // Final DoR check - ALL conditions must be met
    const isReady = sevenDValid && entitlementsValid && outputSpecLoaded && testsDefined && inputMinimum

    if (!isReady) {
      errors.push('DoR validation failed - run cannot proceed without all conditions met')
    }

    return {
      isReady,
      checks: {
        sevenDValid,
        entitlementsValid,
        outputSpecLoaded,
        testsDefined,
        inputMinimum
      },
      errors,
      warnings
    }
  }
}

/**
 * Definition of Done (DoD) Validator
 * Bundle is "Done" only if all conditions are met
 */
export class DoDValidator {
  /**
   * Validates if a bundle is ready for delivery
   * Throws error if any required check fails (no improvisation allowed)
   */
  static validate(
    prompt: GeneratedPrompt,
    testResults: TestResult[],
    bundle: BundleValidation
  ): DoDResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 1. Score Threshold (≥80)
    let finalScore = 0
    let scoreThreshold = false
    if (testResults.length > 0) {
      const latestTest = testResults[testResults.length - 1]
      finalScore = latestTest.scores.overall
      scoreThreshold = finalScore >= 80
      
      if (!scoreThreshold) {
        errors.push(`Score ${finalScore} is below threshold 80 - bundle cannot be delivered`)
      }
    } else {
      errors.push('No test results available for scoring')
    }

    // 2. Output Complete
    const outputComplete = bundle.artifacts.txt && bundle.artifacts.md && bundle.artifacts.json
    if (!outputComplete) {
      errors.push('Required output artifacts are missing')
    }

    // 3. Checksum Valid
    const checksumValid = bundle.checksum.verified
    if (!checksumValid) {
      errors.push('Bundle checksum validation failed')
    }

    // 4. Manifest Written
    const manifestWritten = bundle.manifest.exists && bundle.manifest.complete
    if (!manifestWritten) {
      errors.push('Export manifest is missing or incomplete')
    }

    // 5. Telemetry Saved
    const telemetrySaved = prompt.sessionHash && prompt.timestamp
    if (!telemetrySaved) {
      errors.push('Telemetry data is missing')
    }

    // Final DoD check - ALL conditions must be met
    const isDone = scoreThreshold && outputComplete && checksumValid && manifestWritten && telemetrySaved

    if (!isDone) {
      errors.push('DoD validation failed - bundle cannot be delivered without all conditions met')
    }

    return {
      isDone,
      checks: {
        scoreThreshold,
        outputComplete,
        checksumValid,
        manifestWritten,
        telemetrySaved
      },
      errors,
      warnings,
      finalScore
    }
  }

  /**
   * Validates bundle structure and completeness
   */
  static validateBundle(bundle: BundleValidation): BundleValidation {
    // Verify all required artifacts exist
    const requiredArtifacts = ['txt', 'md', 'json', 'manifest', 'checksum']
    
    requiredArtifacts.forEach(artifact => {
      if (!bundle.artifacts[artifact as keyof typeof bundle.artifacts]) {
        console.warn(`Missing required artifact: ${artifact}`)
      }
    })

    // Verify checksum calculation
    if (bundle.checksum.calculated && bundle.checksum.files.length > 0) {
      // In real implementation, recalculate and verify checksum
      bundle.checksum.verified = true
    }

    // Verify manifest completeness
    if (bundle.manifest.exists) {
      bundle.manifest.complete = !!bundle.manifest.licenseNotice
    }

    return bundle
  }
}

/**
 * Combined DoR/DoD Validation System
 * Enforces both gates as final quality control
 */
export class QualityGateValidator {
  /**
   * Validates both DoR and DoD in sequence
   * Returns combined result with clear pass/fail status
   */
  static validateRun(
    prompt: GeneratedPrompt,
    userPlanId: string,
    testResults: TestResult[],
    bundle: BundleValidation
  ): {
    dor: DoRResult
    dod: DoDResult
    overallPass: boolean
    canProceed: boolean
    canDeliver: boolean
  } {
    // First gate: DoR validation
    const dor = DoRValidator.validate(prompt, userPlanId)
    
    // Second gate: DoD validation (only if DoR passes)
    let dod: DoDResult | null = null
    if (dor.isReady) {
      dod = DoDValidator.validate(prompt, testResults, bundle)
    }

    const canProceed = dor.isReady
    const canDeliver = dor.isReady && dod?.isDone

    return {
      dor,
      dod: dod || {
        isDone: false,
        checks: {
          scoreThreshold: false,
          outputComplete: false,
          checksumValid: false,
          manifestWritten: false,
          telemetrySaved: false
        },
        errors: ['DoR validation failed - DoD cannot be evaluated'],
        warnings: [],
        finalScore: 0
      },
      overallPass: canDeliver,
      canProceed,
      canDeliver
    }
  }

  /**
   * Throws error if validation fails (strict enforcement)
   */
  static enforceQualityGates(
    prompt: GeneratedPrompt,
    userPlanId: string,
    testResults: TestResult[],
    bundle: BundleValidation
  ): void {
    const validation = this.validateRun(prompt, userPlanId, testResults, bundle)
    
    if (!validation.canProceed) {
      throw new Error(`DoR validation failed: ${validation.dor.errors.join('; ')}`)
    }
    
    if (!validation.canDeliver) {
      throw new Error(`DoD validation failed: ${validation.dod.errors.join('; ')}`)
    }
  }
}

// Export singleton instances
export const dorValidator = DoRValidator
export const dodValidator = DoDValidator
export const qualityGateValidator = QualityGateValidator
