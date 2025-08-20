/**
 * lib/openai/input-validator.ts — Input Validation and Sanitization
 * 
 * Provides comprehensive input validation, sanitization, and security measures
 * Prevents injection attacks and ensures data quality
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedInput?: string
}

export interface ValidationRules {
  maxLength: number
  minLength: number
  allowedTags: string[]
  blockedPatterns: RegExp[]
  requiredFields: string[]
}

export class InputValidator {
  private static instance: InputValidator
  
  // Default validation rules
  private defaultRules: ValidationRules = {
    maxLength: 10000, // 10KB max
    minLength: 10,    // 10 chars min
    allowedTags: ['b', 'i', 'em', 'strong', 'code', 'pre'],
    blockedPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
      /javascript:/gi,                                          // JavaScript protocol
      /on\w+\s*=/gi,                                           // Event handlers
      /data:text\/html/gi,                                     // Data URLs
      /vbscript:/gi,                                           // VBScript
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,  // Iframes
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,  // Objects
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,     // Embeds
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,        // Link tags
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,        // Meta tags
    ],
    requiredFields: ['prompt']
  }

  private constructor() {}

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator()
    }
    return InputValidator.instance
  }

  /**
   * Validate prompt input
   */
  validatePrompt(input: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if input exists
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        errors: ['Input is required and must be a string'],
        warnings: []
      }
    }

    // Length validation
    if (input.length < this.defaultRules.minLength) {
      errors.push(`Input too short. Minimum ${this.defaultRules.minLength} characters required.`)
    }

    if (input.length > this.defaultRules.maxLength) {
      errors.push(`Input too long. Maximum ${this.defaultRules.maxLength} characters allowed.`)
    }

    // Security validation
    const securityResult = this.validateSecurity(input)
    errors.push(...securityResult.errors)
    warnings.push(...securityResult.warnings)

    // Content validation
    const contentResult = this.validateContent(input)
    errors.push(...contentResult.errors)
    warnings.push(...contentResult.warnings)

    // Sanitize input if valid
    let sanitizedInput: string | undefined
    if (errors.length === 0) {
      sanitizedInput = this.sanitizeInput(input)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedInput
    }
  }

  /**
   * Validate input object (for API requests)
   */
  validateInputObject(input: Record<string, any>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required fields
    for (const field of this.defaultRules.requiredFields) {
      if (!input[field]) {
        errors.push(`Required field '${field}' is missing`)
      }
    }

    // Validate prompt if present
    if (input.prompt) {
      const promptResult = this.validatePrompt(input.prompt)
      errors.push(...promptResult.errors)
      warnings.push(...promptResult.warnings)
    }

    // Validate other fields
    if (input.model && typeof input.model !== 'string') {
      errors.push('Model must be a string')
    }

    if (input.maxTokens && (typeof input.maxTokens !== 'number' || input.maxTokens < 1 || input.maxTokens > 4000)) {
      errors.push('Max tokens must be a number between 1 and 4000')
    }

    if (input.temperature && (typeof input.temperature !== 'number' || input.temperature < 0 || input.temperature > 2)) {
      errors.push('Temperature must be a number between 0 and 2')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate security aspects of input
   */
  private validateSecurity(input: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for blocked patterns
    for (const pattern of this.defaultRules.blockedPatterns) {
      if (pattern.test(input)) {
        errors.push(`Input contains blocked content: ${pattern.source}`)
      }
    }

    // Check for potential XSS
    if (input.includes('<') && input.includes('>')) {
      warnings.push('Input contains HTML-like content. Ensure proper sanitization.')
    }

    // Check for suspicious URLs
    const urlPattern = /https?:\/\/[^\s]+/gi
    const urls = input.match(urlPattern)
    if (urls) {
      for (const url of urls) {
        if (this.isSuspiciousUrl(url)) {
          warnings.push(`Suspicious URL detected: ${url}`)
        }
      }
    }

    // Check for excessive special characters
    const specialCharRatio = (input.match(/[^a-zA-Z0-9\s]/g) || []).length / input.length
    if (specialCharRatio > 0.3) {
      warnings.push('Input contains many special characters. Review for potential issues.')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * Validate content quality
   */
  private validateContent(input: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for repetitive content
    const words = input.toLowerCase().split(/\s+/)
    const wordCount = new Map<string, number>()
    
    for (const word of words) {
      if (word.length > 3) { // Only check words longer than 3 chars
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
      }
    }

    for (const [word, count] of wordCount.entries()) {
      if (count > 5) {
        warnings.push(`Word '${word}' appears ${count} times. Consider reducing repetition.`)
      }
    }

    // Check for all caps
    const capsRatio = (input.match(/[A-Z]/g) || []).length / input.length
    if (capsRatio > 0.7) {
      warnings.push('Input contains mostly uppercase letters. Consider using proper case.')
    }

    // Check for excessive whitespace
    const whitespaceRatio = (input.match(/\s/g) || []).length / input.length
    if (whitespaceRatio > 0.4) {
      warnings.push('Input contains excessive whitespace. Consider cleaning up formatting.')
    }

    // Check for minimum meaningful content
    const meaningfulContent = input.replace(/\s+/g, '').length
    if (meaningfulContent < this.defaultRules.minLength) {
      errors.push(`Input contains insufficient meaningful content. At least ${this.defaultRules.minLength} characters required.`)
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  /**
   * Sanitize input content
   */
  private sanitizeInput(input: string): string {
    let sanitized = input

    // Remove or escape potentially dangerous content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT_REMOVED]')
    sanitized = sanitized.replace(/javascript:/gi, 'javascript-removed:')
    sanitized = sanitized.replace(/on\w+\s*=/gi, 'event-handler-removed=')
    sanitized = sanitized.replace(/data:text\/html/gi, 'data-removed')
    sanitized = sanitized.replace(/vbscript:/gi, 'vbscript-removed:')

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim()

    // Limit consecutive special characters
    sanitized = sanitized.replace(/([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){3,}/g, '$1$1$1')

    return sanitized
  }

  /**
   * Check if URL is suspicious
   */
  private isSuspiciousUrl(url: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /about:/i,
      /chrome:/i,
      /chrome-extension:/i,
      /moz-extension:/i,
      /safari-extension:/i,
      /ms-browser-extension:/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(url))
  }

  /**
   * Validate 7D parameters
   */
  validateSevenD(sevenD: Record<string, any>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const requiredFields = ['domain', 'scale', 'urgency', 'complexity', 'resources', 'application', 'output']
    
    for (const field of requiredFields) {
      if (!sevenD[field]) {
        errors.push(`Required 7D field '${field}' is missing`)
      }
    }

    // Validate domain
    if (sevenD.domain && !['generic', 'ecommerce', 'education', 'fintech', 'healthcare', 'legal', 'marketing', 'sales', 'support', 'technical'].includes(sevenD.domain)) {
      errors.push(`Invalid domain: ${sevenD.domain}`)
    }

    // Validate scale
    if (sevenD.scale && !['individual', 'team', 'department', 'organization', 'enterprise'].includes(sevenD.scale)) {
      errors.push(`Invalid scale: ${sevenD.scale}`)
    }

    // Validate urgency
    if (sevenD.urgency && !['low', 'normal', 'high', 'critical'].includes(sevenD.urgency)) {
      errors.push(`Invalid urgency: ${sevenD.urgency}`)
    }

    // Validate complexity
    if (sevenD.complexity && !['simple', 'medium', 'complex', 'expert'].includes(sevenD.complexity)) {
      errors.push(`Invalid complexity: ${sevenD.complexity}`)
    }

    // Validate resources
    if (sevenD.resources && !['minimal', 'standard', 'enhanced', 'premium'].includes(sevenD.resources)) {
      errors.push(`Invalid resources: ${sevenD.resources}`)
    }

    // Validate application
    if (sevenD.application && !['content_ops', 'customer_support', 'sales_enablement', 'training', 'documentation', 'analysis'].includes(sevenD.application)) {
      errors.push(`Invalid application: ${sevenD.application}`)
    }

    // Validate output
    if (sevenD.output && !['single', 'bundle', 'collection'].includes(sevenD.output)) {
      errors.push(`Invalid output: ${sevenD.output}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get validation statistics
   */
  getValidationStats() {
    return {
      rules: this.defaultRules,
      blockedPatterns: this.defaultRules.blockedPatterns.length,
      allowedTags: this.defaultRules.allowedTags.length
    }
  }
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance()
