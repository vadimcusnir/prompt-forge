/**
 * lib/validator.ts — Client-safe validation (second safety layer)
 * 
 * Implements strict 7D validation with enum_only: true and raise_on_invalid: true
 * Uses hardcoded validation rules for client-side safety
 */

// Hardcoded validation rules (extracted from ruleset.yml and aligned with agent.ts)
const VALIDATION_RULES = {
  seven_d: {
    domain: {
      codes: ['FIN', 'ECOM', 'EDU', 'SAAS', 'HEALTH', 'LEGAL', 'GOV', 'MEDIA'],
      defaults_by_code: {
        FIN: {
          scale: 'team',
          urgency: 'normal',
          complexity: 'medium',
          resources: 'standard',
          application: 'content_ops',
          output: 'bundle'
        },
        ECOM: {
          scale: 'team',
          urgency: 'normal',
          complexity: 'medium',
          resources: 'standard',
          application: 'sales_ops',
          output: 'bundle'
        },
        EDU: {
          scale: 'team',
          urgency: 'normal',
          complexity: 'medium',
          resources: 'standard',
          application: 'research',
          output: 'bundle'
        },
        SAAS: {
          scale: 'team',
          urgency: 'normal',
          complexity: 'medium',
          resources: 'standard',
          application: 'product_ops',
          output: 'bundle'
        },
        HEALTH: {
          scale: 'org',
          urgency: 'high',
          complexity: 'high',
          resources: 'extended',
          application: 'research',
          output: 'bundle'
        },
        LEGAL: {
          scale: 'org',
          urgency: 'normal',
          complexity: 'high',
          resources: 'extended',
          application: 'crisis_ops',
          output: 'bundle'
        },
        GOV: {
          scale: 'org',
          urgency: 'high',
          complexity: 'high',
          resources: 'extended',
          application: 'research',
          output: 'bundle'
        },
        MEDIA: {
          scale: 'team',
          urgency: 'normal',
          complexity: 'medium',
          resources: 'standard',
          application: 'content_ops',
          output: 'bundle'
        }
      }
    },
    scale: ['solo', 'team', 'org', 'market'],
    urgency: ['low', 'normal', 'high', 'crisis'],
    complexity: ['low', 'medium', 'high'],
    resources: ['minimal', 'standard', 'extended'],
    application: ['content_ops', 'sales_ops', 'product_ops', 'research', 'crisis_ops'],
    output: ['text', 'sop', 'plan', 'bundle']
  },
  scoring: {
    threshold: 80,
    rubric: ['clarity', 'execution', 'ambiguity', 'business_fit']
  },
  export_bundle: {
    artifacts_order: ['prompt.txt', 'prompt.json', 'prompt.md', 'prompt.pdf', 'manifest.json'],
    gating: {
      pdf_min_plan: 'pro',
      json_min_plan: 'pro',
      zip_min_plan: 'enterprise'
    }
  }
}

// 7D Validation with enum_only: true and raise_on_invalid: true
export interface SevenDParams {
  domain: string
  scale: string
  urgency: string
  complexity: string
  resources: string
  application: string
  output: string
}

export class SevenDValidator {
  private static instance: SevenDValidator
  private ruleset: typeof VALIDATION_RULES // Changed to use hardcoded rules

  private constructor() {
    this.ruleset = VALIDATION_RULES
  }

  static getInstance(): SevenDValidator {
    if (!SevenDValidator.instance) {
      SevenDValidator.instance = new SevenDValidator()
    }
    return SevenDValidator.instance
  }

  /**
   * Validates 7D parameters against SSOT enums
   * Throws error if any value is not in allowed enum (raise_on_invalid: true)
   */
  validate(params: Partial<SevenDParams>): SevenDParams {
    const errors: string[] = []
    
    // Validate each parameter against its enum
    if (params.domain && !this.ruleset.seven_d.domain.codes.includes(params.domain)) {
      errors.push(`Invalid domain: ${params.domain}. Allowed: [${this.ruleset.seven_d.domain.codes.join(', ')}]`)
    }
    
    if (params.scale && !this.ruleset.seven_d.scale.includes(params.scale)) {
      errors.push(`Invalid scale: ${params.scale}. Allowed: [${this.ruleset.seven_d.scale.join(', ')}]`)
    }
    
    if (params.urgency && !this.ruleset.seven_d.urgency.includes(params.urgency)) {
      errors.push(`Invalid urgency: ${params.urgency}. Allowed: [${this.ruleset.seven_d.urgency.join(', ')}]`)
    }
    
    if (params.complexity && !this.ruleset.seven_d.complexity.includes(params.complexity)) {
      errors.push(`Invalid complexity: ${params.complexity}. Allowed: [${this.ruleset.seven_d.complexity.join(', ')}]`)
    }
    
    if (params.resources && !this.ruleset.seven_d.resources.includes(params.resources)) {
      errors.push(`Invalid resources: ${params.resources}. Allowed: [${this.ruleset.seven_d.resources.join(', ')}]`)
    }
    
    if (params.application && !this.ruleset.seven_d.application.includes(params.application)) {
      errors.push(`Invalid application: ${params.application}. Allowed: [${this.ruleset.seven_d.application.join(', ')}]`)
    }
    
    if (params.output && !this.ruleset.seven_d.output.includes(params.output)) {
      errors.push(`Invalid output: ${params.output}. Allowed: [${this.ruleset.seven_d.output.join(', ')}]`)
    }

    // raise_on_invalid: true - throw error for any invalid value
    if (errors.length > 0) {
      throw new Error(`7D_VALIDATION_ERROR: ${errors.join('; ')}`)
    }

    // Return normalized params with defaults for missing values
    return this.normalizeWithDefaults(params)
  }

  /**
   * Normalizes 7D parameters with domain-specific defaults from ruleset
   */
  private normalizeWithDefaults(params: Partial<SevenDParams>): SevenDParams {
    const domain = params.domain || 'generic'
    
    // Get domain defaults if available
    const domainDefaults = this.ruleset.seven_d.domain.defaults_by_code[domain] || {
      scale: 'team',
      urgency: 'normal',
      complexity: 'medium',
      resources: 'standard',
      application: 'content_ops',
      output: 'bundle'
    }

    return {
      domain: domain,
      scale: params.scale || domainDefaults.scale,
      urgency: params.urgency || domainDefaults.urgency,
      complexity: params.complexity || domainDefaults.complexity,
      resources: params.resources || domainDefaults.resources,
      application: params.application || domainDefaults.application,
      output: params.output || domainDefaults.output
    }
  }

  /**
   * Validates scoring against threshold from ruleset
   */
  validateScore(scores: Record<string, number>): boolean {
    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
    return overall >= this.ruleset.scoring.threshold
  }

  /**
   * Gets export bundle gating requirements
   */
  getExportGating(format: string): { minPlan: string; allowed: boolean } {
    switch (format) {
      case 'pdf':
        return { minPlan: this.ruleset.export_bundle.gating.pdf_min_plan, allowed: true }
      case 'json':
        return { minPlan: this.ruleset.export_bundle.gating.json_min_plan, allowed: true }
      case 'zip':
        return { minPlan: this.ruleset.export_bundle.gating.zip_min_plan, allowed: true }
      default:
        return { minPlan: 'pilot', allowed: true }
    }
  }
}

// Export singleton instance
export const sevenDValidator = SevenDValidator.getInstance()
