/**
 * lib/security/input-sanitizer.ts
 * 
 * Input Sanitization System
 * - Prevent prompt injection attacks
 * - Sanitize user inputs
 * - Validate data formats
 * - Remove malicious content
 */

export interface SanitizationOptions {
  allowHtml: boolean;
  allowScripts: boolean;
  allowUrls: boolean;
  maxLength: number;
  allowedTags: string[];
  blockedPatterns: RegExp[];
}

export interface SanitizationResult {
  sanitized: string;
  warnings: string[];
  blocked: boolean;
  reason?: string;
}

export class InputSanitizer {
  private static instance: InputSanitizer;
  private defaultOptions: SanitizationOptions;

  private constructor() {
    this.defaultOptions = {
      allowHtml: false,
      allowScripts: false,
      allowUrls: false,
      maxLength: 10000,
      allowedTags: [],
      blockedPatterns: [
        // Prompt injection patterns
        /(?:system|assistant|user|human|bot|ai|gpt|openai|claude|anthropic):/i,
        /(?:ignore|forget|disregard|stop|end|exit|quit|halt|terminate)/i,
        /(?:previous|above|earlier|before|instructions|rules|guidelines)/i,
        /(?:roleplay|act as|pretend|simulate|imitate)/i,
        /(?:hack|exploit|vulnerability|security|breach|attack)/i,
        /(?:admin|root|superuser|privileged|elevated)/i,
        /(?:delete|remove|drop|truncate|clear|wipe)/i,
        /(?:password|secret|key|token|credential)/i,
        
        // SQL injection patterns
        /(?:union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
        /(?:or\s+\d+\s*=\s*\d+|and\s+\d+\s*=\s*\d+)/i,
        /(?:';|--|#|\/\*|\*\/)/,
        
        // XSS patterns
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>/gi,
        /<object[^>]*>/gi,
        /<embed[^>]*>/gi,
        
        // Command injection patterns
        /(?:;|\||&|`|\$\(|\$\{)/,
        /(?:rm|del|format|fdisk|mkfs|dd)/i,
        
        // File path traversal
        /(?:\.\.\/|\.\.\\)/,
        /(?:\/etc\/|\/var\/|\/usr\/|\/home\/|\/root\/)/,
        
        // Sensitive data patterns
        /(?:ssn|social\s*security|credit\s*card|bank\s*account|routing\s*number)/i,
        /(?:phone|mobile|cell|fax|extension)/i,
        /(?:address|street|city|state|zip|postal)/i,
        /(?:birth|dob|age|gender|race|ethnicity)/i,
        
        // Malicious URLs
        /(?:http|https):\/\/[^\s]*\.(?:exe|bat|com|pif|scr|vbs|js|jar|msi)/i,
        /(?:data|vbscript|javascript):/i
      ]
    };
  }

  public static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  /**
   * Sanitize user input with custom options
   */
  sanitizeInput(
    input: string,
    options?: Partial<SanitizationOptions>
  ): SanitizationResult {
    const opts = { ...this.defaultOptions, ...options };
    const warnings: string[] = [];
    let sanitized = input;

    try {
      // Check length
      if (sanitized.length > opts.maxLength) {
        warnings.push(`Input truncated from ${sanitized.length} to ${opts.maxLength} characters`);
        sanitized = sanitized.substring(0, opts.maxLength);
      }

      // Check for blocked patterns
      for (const pattern of opts.blockedPatterns) {
        if (pattern.test(sanitized)) {
          return {
            sanitized: '',
            warnings,
            blocked: true,
            reason: `Blocked pattern detected: ${pattern.source}`
          };
        }
      }

      // Remove HTML if not allowed
      if (!opts.allowHtml) {
        sanitized = this.removeHtml(sanitized);
      } else if (opts.allowedTags.length > 0) {
        sanitized = this.allowSpecificTags(sanitized, opts.allowedTags);
      }

      // Remove scripts if not allowed
      if (!opts.allowScripts) {
        sanitized = this.removeScripts(sanitized);
      }

      // Remove URLs if not allowed
      if (!opts.allowUrls) {
        sanitized = this.removeUrls(sanitized);
      }

      // Normalize whitespace
      sanitized = this.normalizeWhitespace(sanitized);

      // Remove control characters
      sanitized = this.removeControlCharacters(sanitized);

      // Encode special characters
      sanitized = this.encodeSpecialCharacters(sanitized);

      return {
        sanitized,
        warnings,
        blocked: false
      };
    } catch (error) {
      return {
        sanitized: '',
        warnings: [...warnings, `Sanitization error: ${error}`],
        blocked: true,
        reason: 'Sanitization error occurred'
      };
    }
  }

  /**
   * Sanitize prompt input specifically
   */
  sanitizePrompt(
    prompt: string,
    context?: string
  ): SanitizationResult {
    const promptOptions: Partial<SanitizationOptions> = {
      allowHtml: false,
      allowScripts: false,
      allowUrls: false,
      maxLength: 5000,
      blockedPatterns: [
        ...this.defaultOptions.blockedPatterns,
        // Additional prompt-specific patterns
        /(?:ignore\s+all\s+previous\s+instructions)/i,
        /(?:forget\s+everything\s+you\s+know)/i,
        /(?:you\s+are\s+now\s+a\s+different\s+ai)/i,
        /(?:pretend\s+to\s+be\s+someone\s+else)/i,
        /(?:act\s+as\s+if\s+you\s+are)/i,
        /(?:simulate\s+being\s+a\s+human)/i,
        /(?:bypass\s+all\s+safety\s+measures)/i,
        /(?:ignore\s+ethical\s+guidelines)/i,
        /(?:generate\s+harmful\s+content)/i,
        /(?:create\s+malicious\s+code)/i
      ]
    };

    return this.sanitizeInput(prompt, promptOptions);
  }

  /**
   * Sanitize 7D parameters
   */
  sanitize7DParams(params: Record<string, any>): SanitizationResult {
    const sanitizedParams: Record<string, any> = {};
    const warnings: string[] = [];

    try {
      for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
          const result = this.sanitizeInput(value, {
            allowHtml: false,
            allowScripts: false,
            allowUrls: false,
            maxLength: 100
          });

          if (result.blocked) {
            return {
              sanitized: '',
              warnings: [...warnings, `Parameter ${key} blocked: ${result.reason}`],
              blocked: true,
              reason: `7D parameter ${key} contains blocked content`
            };
          }

          sanitizedParams[key] = result.sanitized;
          warnings.push(...result.warnings);
        } else {
          sanitizedParams[key] = value;
        }
      }

      return {
        sanitized: JSON.stringify(sanitizedParams),
        warnings,
        blocked: false
      };
    } catch (error) {
      return {
        sanitized: '',
        warnings: [...warnings, `7D sanitization error: ${error}`],
        blocked: true,
        reason: '7D parameter sanitization failed'
      };
    }
  }

  /**
   * Remove HTML tags
   */
  private removeHtml(input: string): string {
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-zA-Z0-9#]+;/g, '');
  }

  /**
   * Allow specific HTML tags only
   */
  private allowSpecificTags(input: string, allowedTags: string[]): string {
    const tagPattern = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
    
    return input.replace(tagPattern, (match, slash, tagName, attributes) => {
      const lowerTagName = tagName.toLowerCase();
      if (allowedTags.includes(lowerTagName)) {
        // Only allow safe attributes
        const safeAttributes = this.sanitizeAttributes(attributes);
        return `<${slash}${tagName}${safeAttributes}>`;
      }
      return '';
    });
  }

  /**
   * Sanitize HTML attributes
   */
  private sanitizeAttributes(attributes: string): string {
    const safeAttributes = ['class', 'id', 'style', 'title', 'alt', 'href'];
    const attributePattern = /(\w+)\s*=\s*["']([^"']*)["']/g;
    
    return attributes.replace(attributePattern, (match, attrName, attrValue) => {
      const lowerAttrName = attrName.toLowerCase();
      if (safeAttributes.includes(lowerAttrName)) {
        // Remove any script-like content from attribute values
        const sanitizedValue = attrValue
          .replace(/javascript:/gi, '')
          .replace(/on\w+/gi, '')
          .replace(/<script/gi, '');
        
        return `${attrName}="${sanitizedValue}"`;
      }
      return '';
    });
  }

  /**
   * Remove script tags and content
   */
  private removeScripts(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/Function\s*\(/gi, '')
      .replace(/setTimeout\s*\(/gi, '')
      .replace(/setInterval\s*\(/gi, '');
  }

  /**
   * Remove URLs
   */
  private removeUrls(input: string): string {
    return input
      .replace(/(?:https?|ftp|file|data|mailto):\/\/[^\s]+/gi, '[URL]')
      .replace(/www\.[^\s]+/gi, '[URL]');
  }

  /**
   * Normalize whitespace
   */
  private normalizeWhitespace(input: string): string {
    return input
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Remove control characters
   */
  private removeControlCharacters(input: string): string {
    return input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  }

  /**
   * Encode special characters
   */
  private encodeSpecialCharacters(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for potential prompt injection
   */
  detectPromptInjection(input: string): {
    detected: boolean;
    confidence: number;
    patterns: string[];
  } {
    const injectionPatterns = [
      { pattern: /(?:ignore|forget|disregard)\s+(?:all|everything|previous|above)/i, weight: 0.9 },
      { pattern: /(?:system|assistant|user|human|bot|ai):/i, weight: 0.8 },
      { pattern: /(?:roleplay|act\s+as|pretend|simulate)/i, weight: 0.7 },
      { pattern: /(?:bypass|ignore)\s+(?:safety|ethical|guidelines)/i, weight: 0.9 },
      { pattern: /(?:generate|create)\s+(?:harmful|malicious|dangerous)/i, weight: 0.8 },
      { pattern: /(?:you\s+are\s+now\s+a\s+different)/i, weight: 0.7 },
      { pattern: /(?:ignore\s+your\s+training)/i, weight: 0.8 }
    ];

    let totalWeight = 0;
    const detectedPatterns: string[] = [];

    for (const { pattern, weight } of injectionPatterns) {
      if (pattern.test(input)) {
        totalWeight += weight;
        detectedPatterns.push(pattern.source);
      }
    }

    const confidence = Math.min(totalWeight, 1.0);
    const detected = confidence > 0.5;

    return {
      detected,
      confidence,
      patterns: detectedPatterns
    };
  }

  /**
   * Get sanitization statistics
   */
  getSanitizationStats(): {
    totalInputs: number;
    blockedInputs: number;
    warningsGenerated: number;
    patternsBlocked: string[];
  } {
    // This would typically track statistics over time
    // For now, return mock data
    return {
      totalInputs: 0,
      blockedInputs: 0,
      warningsGenerated: 0,
      patternsBlocked: []
    };
  }
}

export const inputSanitizer = InputSanitizer.getInstance();
