/**
 * lib/client-agent.ts — Client-side 7D Engine (Browser-Safe)
 * 
 * Browser-compatible implementation of 7D validation without Node.js dependencies
 */

// 7D Parameters Interface
export interface SevenDParams {
  domain: string;
  scale: string;
  urgency: string;
  complexity: string;
  resources: string;
  application: string;
  output: string;
}

/**
 * Domain-specific defaults from ruleset.yml
 */
const DOMAIN_DEFAULTS: Record<string, Partial<SevenDParams>> = {
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
};

/**
 * 7D Enum Values from ruleset.yml
 */
const SEVEN_D_ENUMS = {
  domain: ['FIN', 'ECOM', 'EDU', 'SAAS', 'HEALTH', 'LEGAL', 'GOV', 'MEDIA'],
  scale: ['solo', 'team', 'org', 'market'],
  urgency: ['low', 'normal', 'high', 'crisis'],
  complexity: ['low', 'medium', 'high'],
  resources: ['minimal', 'standard', 'extended'],
  application: ['content_ops', 'sales_ops', 'product_ops', 'research', 'crisis_ops'],
  output: ['text', 'sop', 'plan', 'bundle']
};

/**
 * Client-side 7D Validator Class
 */
export class ClientSevenDValidator {
  /**
   * Validates 7D parameters against SSOT enums
   * Throws error if any value is not in allowed enum (raise_on_invalid: true)
   */
  static validate(params: Partial<SevenDParams>): SevenDParams {
    const errors: string[] = [];
    
    // Validate each parameter against its enum
    if (params.domain && !SEVEN_D_ENUMS.domain.includes(params.domain)) {
      errors.push(`Invalid domain: ${params.domain}. Allowed: [${SEVEN_D_ENUMS.domain.join(', ')}]`);
    }
    
    if (params.scale && !SEVEN_D_ENUMS.scale.includes(params.scale)) {
      errors.push(`Invalid scale: ${params.scale}. Allowed: [${SEVEN_D_ENUMS.scale.join(', ')}]`);
    }
    
    if (params.urgency && !SEVEN_D_ENUMS.urgency.includes(params.urgency)) {
      errors.push(`Invalid urgency: ${params.urgency}. Allowed: [${SEVEN_D_ENUMS.urgency.join(', ')}]`);
    }
    
    if (params.complexity && !SEVEN_D_ENUMS.complexity.includes(params.complexity)) {
      errors.push(`Invalid complexity: ${params.complexity}. Allowed: [${SEVEN_D_ENUMS.complexity.join(', ')}]`);
    }
    
    if (params.resources && !SEVEN_D_ENUMS.resources.includes(params.resources)) {
      errors.push(`Invalid resources: ${params.resources}. Allowed: [${SEVEN_D_ENUMS.resources.join(', ')}]`);
    }
    
    if (params.application && !SEVEN_D_ENUMS.application.includes(params.application)) {
      errors.push(`Invalid application: ${params.application}. Allowed: [${SEVEN_D_ENUMS.application.join(', ')}]`);
    }
    
    if (params.output && !SEVEN_D_ENUMS.output.includes(params.output)) {
      errors.push(`Invalid output: ${params.output}. Allowed: [${SEVEN_D_ENUMS.output.join(', ')}]`);
    }

    // raise_on_invalid: true - throw error for any invalid value
    if (errors.length > 0) {
      throw new Error(`7D_VALIDATION_ERROR: ${errors.join('; ')}`);
    }

    // Return normalized params with defaults for missing values
    return this.normalizeWithDefaults(params);
  }

  /**
   * Normalizes 7D parameters with domain-specific defaults from ruleset
   */
  static normalizeWithDefaults(params: Partial<SevenDParams>): SevenDParams {
    const domain = params.domain || 'SAAS';
    
    // Get domain defaults if available
    const domainDefaults = DOMAIN_DEFAULTS[domain] || {
      scale: 'team',
      urgency: 'normal',
      complexity: 'medium',
      resources: 'standard',
      application: 'content_ops',
      output: 'bundle'
    };

    return {
      domain: domain,
      scale: params.scale || domainDefaults.scale || 'team',
      urgency: params.urgency || domainDefaults.urgency || 'normal',
      complexity: params.complexity || domainDefaults.complexity || 'medium',
      resources: params.resources || domainDefaults.resources || 'standard',
      application: params.application || domainDefaults.application || 'content_ops',
      output: params.output || domainDefaults.output || 'bundle'
    };
  }

  /**
   * Generates 7D signature for validation and chain compatibility
   */
  static generateSignature(params: SevenDParams): string {
    const signature = `${params.domain}|${params.scale}|${params.urgency}|${params.complexity}|${params.resources}|${params.application}|${params.output}`;
    // Use btoa for browser-compatible base64 encoding
    return btoa(signature);
  }

  /**
   * Validates 7D signature for chain compatibility
   */
  static validateSignature(signature: string, params: SevenDParams): boolean {
    const expectedSignature = this.generateSignature(params);
    return signature === expectedSignature;
  }

  /**
   * Gets domain-specific recommendations based on 7D parameters
   */
  static getDomainRecommendations(params: SevenDParams): string[] {
    const recommendations: string[] = [];
    
    switch (params.domain) {
      case 'FIN':
        recommendations.push('Ensure PCI DSS compliance for financial data');
        recommendations.push('Include risk assessment and mitigation strategies');
        break;
      case 'HEALTH':
        recommendations.push('HIPAA compliance required for patient data');
        recommendations.push('High urgency and extended resources recommended');
        break;
      case 'LEGAL':
        recommendations.push('Include legal disclaimers and compliance notes');
        recommendations.push('Crisis operations mode for urgent legal matters');
        break;
      case 'GOV':
        recommendations.push('FOIA compliance and transparency requirements');
        recommendations.push('High security and audit trail mandatory');
        break;
    }

    if (params.urgency === 'crisis') {
      recommendations.push('Implement crisis response protocols');
      recommendations.push('Include escalation procedures and emergency contacts');
    }

    if (params.complexity === 'high') {
      recommendations.push('Break down into manageable sub-tasks');
      recommendations.push('Include detailed implementation roadmap');
    }

    return recommendations;
  }

  /**
   * Get available enum values for each dimension
   */
  static getEnums() {
    return SEVEN_D_ENUMS;
  }

  /**
   * Get domain defaults
   */
  static getDomainDefaults() {
    return DOMAIN_DEFAULTS;
  }
}

// Client-side agent interface
export const ClientCursorAgent = {
  /**
   * 7D Validation and normalization
   */
  validateSevenD(params: Partial<SevenDParams>): SevenDParams {
    return ClientSevenDValidator.validate(params);
  },

  /**
   * 7D Normalization with defaults
   */
  normalizeSevenD(params: Partial<SevenDParams>): SevenDParams {
    return ClientSevenDValidator.normalizeWithDefaults(params);
  },

  /**
   * Generate 7D signature for validation
   */
  generateSevenDSignature(params: SevenDParams): string {
    return ClientSevenDValidator.generateSignature(params);
  },

  /**
   * Get domain-specific recommendations
   */
  getSevenDRecommendations(params: SevenDParams): string[] {
    return ClientSevenDValidator.getDomainRecommendations(params);
  },

  /**
   * Get enum values
   */
  getSevenDEnums() {
    return ClientSevenDValidator.getEnums();
  },

  /**
   * Get domain defaults
   */
  getSevenDDomainDefaults() {
    return ClientSevenDValidator.getDomainDefaults();
  }
};

// Export default as CursorAgent for compatibility
export default ClientCursorAgent;
