import type { PromptModule, SessionConfig, GeneratedPrompt } from "@/types/promptforge"
import { MODULES } from "./modules"

interface ContextVariants {
  [key: string]: string
}

const CONTEXT_VARIANTS: ContextVariants = {
  SaaS: "a growing SaaS platform serving enterprise clients",
  fintech: "an innovative fintech company developing payment solutions",
  ecommerce: "an online store focused on customer experience",
  consulting: "a strategic consulting firm for tech companies",
  personal_brand: "a personal brand in development with tech audience",
  education: "an educational platform with digital courses",
}

const URGENCY_MAP: ContextVariants = {
  pilot: "a pilot project with 2-week deadline",
  sprint: "a development sprint with 1-month delivery",
  enterprise: "an enterprise implementation with 3-month timeline",
  crisis: "a crisis situation requiring immediate response",
}

const APPLICATION_CONTEXT: ContextVariants = {
  training: "for internal team training",
  audit: "for auditing existing systems",
  implementation: "for direct operational implementation",
  crisis_response: "for responding to an ongoing crisis",
}

const COMPLEXITY_ADAPTATIONS: ContextVariants = {
  standard: "standard implementation with best practices",
  advanced: "advanced implementation with specific optimizations",
  expert: "expert implementation with complex customizations",
}

export function generateSessionHash(config: SessionConfig, moduleId: number): string {
  const hashData = {
    module: moduleId,
    ...config,
    timestamp: Date.now(),
  }

  const hashString = JSON.stringify(hashData)
  let hash = 0
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).substring(0, 8)
}

export function generatePrompt(moduleId: number, config: SessionConfig): GeneratedPrompt {
  const module = MODULES[moduleId]
  if (!module) {
    throw new Error(`Module ${moduleId} not found`)
  }

  const hash = generateSessionHash(config, moduleId)
  const timestamp = new Date()

  const prompt = buildPromptContent(module, config, hash, timestamp)

  return {
    id: hash,
    hash,
    timestamp,
    config,
    moduleId,
    prompt,
  }
}

function buildPromptContent(module: PromptModule, config: SessionConfig, hash: string, timestamp: Date): string {
  const contextDescription = CONTEXT_VARIANTS[config.domain] || config.domain
  const urgencyDescription = URGENCY_MAP[config.urgency] || config.urgency
  const applicationDescription = APPLICATION_CONTEXT[config.application] || config.application
  const complexityDescription = COMPLEXITY_ADAPTATIONS[config.complexity] || config.complexity

  const promptContent = [
    `# ${module.name} - Industrial Generated Prompt`,
    ``,
    `## SESSION CONTEXT`,
    `- **Generation Hash:** ${hash}`,
    `- **Timestamp:** ${timestamp.toLocaleString("en-US")}`,
    `- **Domain:** ${contextDescription}`,
    `- **Scale:** ${config.scale}`,
    `- **Urgency:** ${urgencyDescription}`,
    `- **Application:** ${applicationDescription}`,
    ``,
    `## OBJECTIVE`,
    `${module.description}`,
    ``,
    `Adapt this implementation for the specific context: ${contextDescription} at ${config.scale} level, with urgency "${config.urgency}" and application "${config.application}".`,
    ``,
    `## INPUT REQUIREMENTS`,
    `${module.requirements}`,
    ``,
    `**Contextual adaptations for ${config.domain}:**`,
    `- Consider ${config.domain} industry specifics`,
    `- Adapt to ${config.scale} scale`,
    `- Respect urgency constraints: ${config.urgency}`,
    `- Optimize for application: ${config.application}`,
    ``,
    `## TECHNICAL SPECIFICATIONS`,
    `${module.spec}`,
    ``,
    `**Complexity level:** ${complexityDescription}`,
    `**Available resources:** ${config.resources}`,
    ``,
    `## REQUIRED OUTPUT FORMAT`,
    `${module.output}`,
    ``,
    `**Final format:** ${config.outputFormat}`,
    ``,
    `## VALIDATION KPIs`,
    `${module.kpi}`,
    ``,
    `**Additional metrics for ${config.domain}:**`,
    `- Time to implementation: <${config.urgency === "crisis" ? "24h" : "7 days"}`,
    `- Adoption rate: >${config.scale === "enterprise" ? "85%" : "70%"}`,
    `- Resource efficiency: optimal for "${config.resources}"`,
    ``,
    `## GUARDRAILS`,
    `${module.guardrails}`,
    ``,
    `**Additional constraints:**`,
    `- Respect compliance standards for ${config.domain}`,
    `- Maintain consistency with ${config.scale} brand identity`,
    `- Ensure scalability for future growth`,
    ``,
    `## TELEMETRY`,
    `- **run_id:** "${hash}"`,
    `- **start_ts:** "${timestamp.toISOString()}"`,
    `- **module:** "M${module.id.toString().padStart(2, "0")}"`,
    `- **context:** ${JSON.stringify({ domain: config.domain, scale: config.scale, urgency: config.urgency })}`,
    `- **success_criteria:** {${module.kpi}}`,
    ``,
    `## FAIL-SAFES`,
    `In case required data is missing:`,
    `1. **Alternative A:** Minimal implementation with basic requirements for ${config.domain}`,
    `2. **Alternative B:** Rapid prototype adapted for ${config.urgency}`,
    `3. **Risk estimate:** Medium for ${config.application}, low for ${config.complexity}`,
    ``,
    `## NEXT ACTIONS`,
    `1. **Owner:** Team lead ${config.scale}`,
    `2. **Task:** Implement ${module.name} for ${config.domain}`,
    `3. **Deadline:** According to ${config.urgency} urgency`,
    `4. **Dependencies:** Resources ${config.resources}, format ${config.outputFormat}`,
    ``,
    `---`,
    `**PROMPTFORGE™ v3.0** | Generated: ${timestamp.toLocaleString("en-US")} | Hash: ${hash}`,
  ]

  return promptContent.join("\n")
}

export function rerollPrompt(existingPrompt: GeneratedPrompt): GeneratedPrompt {
  // Generate new prompt with same config but new timestamp/hash
  return generatePrompt(existingPrompt.moduleId, existingPrompt.config)
}

export function validatePromptStructure(prompt: string): {
  score: number
  hasTitle: boolean
  hasContext: boolean
  hasKPI: boolean
  hasOutput: boolean
  hasGuardrails: boolean
} {
  const hasTitle = prompt.includes("#")
  const hasContext = prompt.toLowerCase().includes("context")
  const hasKPI = prompt.toLowerCase().includes("kpi")
  const hasOutput = prompt.toLowerCase().includes("output")
  const hasGuardrails = prompt.toLowerCase().includes("guardrails")

  const components = [hasTitle, hasContext, hasKPI, hasOutput, hasGuardrails]
  const score = Math.round((components.filter(Boolean).length / components.length) * 100)

  return {
    score,
    hasTitle,
    hasContext,
    hasKPI,
    hasOutput,
    hasGuardrails,
  }
}
