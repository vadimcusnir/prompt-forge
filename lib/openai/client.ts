/**
 * lib/openai/client.ts — OpenAI API Client
 * 
 * Provides real GPT API integration with basic error handling
 */

import OpenAI from 'openai'

export interface GPTRequest {
  prompt: string
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  userId: string
  sessionId: string
  planId: string
}

export interface GPTResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason: string
  processingTime: number
}

export interface GPTOptions {
  model: string
  maxTokens: number
  temperature: number
  systemPrompt?: string
}

export class OpenAIClient {
  private static instance: OpenAIClient
  private defaultOptions: GPTOptions = {
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    systemPrompt: 'You are a professional prompt optimization expert.'
  }

  private constructor() {}

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient()
    }
    return OpenAIClient.instance
  }

  /**
   * Generate content using OpenAI API
   */
  async generateContent(request: GPTRequest): Promise<GPTResponse> {
    const startTime = Date.now()
    
    try {
      // 1. Prepare OpenAI request
      const options = this.getOptions(request)
      const messages = this.buildMessages(request.prompt, options.systemPrompt)

      // 2. Make API call
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        organization: process.env.OPENAI_ORGANIZATION,
        maxRetries: 3,
        timeout: 30000, // 30 seconds
      })

      const completion = await openai.chat.completions.create({
        model: options.model,
        messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        user: request.userId, // For abuse monitoring
      })

      // 3. Process response
      const content = completion.choices[0]?.message?.content || ''
      const usage = completion.usage
      const finishReason = completion.choices[0]?.finish_reason || 'stop'
      const processingTime = Date.now() - startTime

      return {
        content,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0
        },
        model: options.model,
        finishReason,
        processingTime
      }

    } catch (error) {
      throw error
    }
  }

  /**
   * Get options for the request
   */
  private getOptions(request: GPTRequest): GPTOptions {
    return {
      model: request.model || this.defaultOptions.model,
      maxTokens: request.maxTokens || this.defaultOptions.maxTokens,
      temperature: request.temperature || this.defaultOptions.temperature,
      systemPrompt: request.systemPrompt || this.defaultOptions.systemPrompt
    }
  }

  /**
   * Build messages array for OpenAI API
   */
  private buildMessages(prompt: string, systemPrompt?: string): any[] {
    const messages = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })
    
    return messages
  }

  /**
   * Validate API key configuration
   */
  static validateConfig(): boolean {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable is not set')
      return false
    }
    return true
  }

  /**
   * Get client status
   */
  static getStatus(): { configured: boolean; model: string; maxTokens: number } {
    return {
      configured: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000')
    }
  }
}
