import type { GeneratedPrompt } from "@/types/promptforge"
import { MODULES } from "./modules"

export interface TestResult {
  id: string
  promptId: string
  timestamp: Date
  executionTime: number
  output: string
  scores: TestScores
  validation: ValidationResult
  status: "success" | "warning" | "error"
  recommendations: string[]
}

export interface TestScores {
  structure: number
  kpiCompliance: number
  clarity: number
  executability: number
  overall: number
}

export interface ValidationResult {
  hasRequiredSections: boolean
  hasValidKPIs: boolean
  hasGuardrails: boolean
  hasFailsafes: boolean
  isExecutable: boolean
  issues: ValidationIssue[]
}

export interface ValidationIssue {
  type: "error" | "warning" | "info"
  section: string
  message: string
  suggestion?: string
}

export interface TestOptions {
  mode: "quick" | "comprehensive" | "stress"
  validateKPIs: boolean
  checkGuardrails: boolean
  simulateFailures: boolean
}

export async function runPromptTest(
  prompt: GeneratedPrompt,
  options: TestOptions = {
    mode: "comprehensive",
    validateKPIs: true,
    checkGuardrails: true,
    simulateFailures: false,
  },
): Promise<TestResult> {
  const startTime = Date.now()

  // Simulate test execution delay
  const executionDelay = options.mode === "quick" ? 1000 : options.mode === "comprehensive" ? 2500 : 4000
  await new Promise((resolve) => setTimeout(resolve, executionDelay))

  const module = MODULES[prompt.moduleId]
  const output = generateTestOutput(prompt, module, options)
  const scores = calculateTestScores(prompt.prompt, output, options)
  const validation = validatePromptStructure(prompt.prompt, module, options)
  const recommendations = generateRecommendations(scores, validation, options)

  const executionTime = Date.now() - startTime
  const status = determineTestStatus(scores, validation)

  return {
    id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    promptId: prompt.id,
    timestamp: new Date(),
    executionTime,
    output,
    scores,
    validation,
    status,
    recommendations,
  }
}

function generateTestOutput(prompt: GeneratedPrompt, module: any, options: TestOptions): string {
  const contextualResponses = {
    SaaS: "scalable SaaS implementation with microservices",
    fintech: "fintech solution compliant with PCI DSS regulations",
    ecommerce: "e-commerce platform optimized for conversions",
    consulting: "consulting framework with validated methodologies",
    personal_brand: "personal branding strategy with measurable metrics",
    education: "educational curriculum with clear learning outcomes",
  }

  const urgencyAdaptations = {
    pilot: "functional prototype for conceptual validation",
    sprint: "agile implementation with incremental deliverables",
    enterprise: "enterprise solution with governance and compliance",
    crisis: "rapid response with implemented mitigation measures",
  }

  const baseResponse =
    contextualResponses[prompt.config.domain as keyof typeof contextualResponses] || "standard implementation"
  const urgencyResponse =
    urgencyAdaptations[prompt.config.urgency as keyof typeof urgencyAdaptations] || "standard implementation"

  if (options.simulateFailures && Math.random() < 0.2) {
    const errorLines = [
      "❌ EXECUTION ERROR",
      "",
      "Prompt could not be executed for the following reasons:",
      `- Missing required parameters for ${module?.name}`,
      `- ${prompt.config.urgency} constraints cannot be met`,
      `- Insufficient resources for ${prompt.config.complexity}`,
      "",
      "Recommendations:",
      "1. Check input requirements",
      "2. Adjust complexity level",
      "3. Review time constraints",
    ]
    return errorLines.join("\n")
  }

  const executionTime = Math.floor(Math.random() * 3000 + 1000)
  const confidence = 85 + Math.floor(Math.random() * 15)
  const kpiCompliance = Math.floor(Math.random() * 20 + 80)

  const successLines = [
    `✅ SUCCESSFUL EXECUTION - ${module?.name}`,
    "",
    "## Implementation Result",
    `Successfully processed requirements for ${baseResponse} in the context of ${urgencyResponse}.`,
    "",
    "### Implemented Components",
    "🔧 **Initial Configuration**",
    `- Validated all input parameters according to ${module?.requirements}`,
    `- Applied configuration for ${prompt.config.domain} domain`,
    `- Set complexity level: ${prompt.config.complexity}`,
    "",
    "🎯 **Main Processing**",
    `- Executed technical specifications: ${module?.spec}`,
    `- Generated output in format: ${prompt.config.outputFormat}`,
    "- Applied all defined guardrails",
    "",
    "📊 **KPI Validation**",
    `- Target metrics: ${module?.kpi}`,
    "- Implementation status: ✅ Complete",
    `- Confidence level: ${confidence}%`,
    "",
    "### Concrete Results",
    "```json",
    "{",
    '  "status": "success",',
    `  "domain": "${prompt.config.domain}",`,
    `  "scale": "${prompt.config.scale}",`,
    `  "execution_time": "${executionTime}ms",`,
    `  "kpi_compliance": ${kpiCompliance}%,`,
    `  "output_format": "${prompt.config.outputFormat}",`,
    '  "next_actions": [',
    `    "Deploy to ${prompt.config.scale} environment",`,
    `    "Monitor KPI according to ${module?.kpi}",`,
    `    "Scale for ${prompt.config.resources} resources"`,
    "  ]",
    "}",
    "```",
    "",
    "### Next Steps Recommendations",
    "1. **Implementation:** Ready for production deployment",
    `2. **Monitoring:** Activate telemetry for ${module?.kpi}`,
    `3. **Scaling:** Prepared for expansion to ${prompt.config.scale} level`,
    `4. **Maintenance:** Schedule reviews according to ${prompt.config.urgency}`,
    "",
    "---",
    `**Test executed successfully** | Time: ${executionTime}ms | Confidence: ${confidence}%`,
  ]

  return successLines.join("\n")
}

function calculateTestScores(prompt: string, output: string, options: TestOptions): TestScores {
  // Structure score based on prompt sections
  let structure = 70
  if (prompt.includes("## CONTEXT")) structure += 8
  if (prompt.includes("## OBJECTIVE")) structure += 8
  if (prompt.includes("## KPI")) structure += 7
  if (prompt.includes("## GUARDRAILS")) structure += 7

  // KPI compliance based on output quality
  let kpiCompliance = 75
  if (output.includes("✅")) kpiCompliance += 10
  if (output.includes("KPI")) kpiCompliance += 8
  if (output.includes("success")) kpiCompliance += 7

  // Clarity based on structure and content
  let clarity = 80
  if (prompt.length > 1000) clarity += 5
  if (prompt.includes("## EXEMPLE")) clarity += 8
  if (prompt.includes("FAIL-SAFES")) clarity += 7

  // Executability based on completeness
  let executability = 78
  if (prompt.includes("TECHNICAL SPECIFICATIONS")) executability += 8
  if (prompt.includes("NEXT ACTIONS")) executability += 7
  if (output.includes("json")) executability += 7

  // Add randomness for realism
  structure += Math.floor(Math.random() * 10 - 5)
  kpiCompliance += Math.floor(Math.random() * 10 - 5)
  clarity += Math.floor(Math.random() * 8 - 4)
  executability += Math.floor(Math.random() * 8 - 4)

  // Ensure scores are within bounds
  structure = Math.max(60, Math.min(100, structure))
  kpiCompliance = Math.max(65, Math.min(100, kpiCompliance))
  clarity = Math.max(70, Math.min(100, clarity))
  executability = Math.max(65, Math.min(100, executability))

  const overall = Math.round((structure + kpiCompliance + clarity + executability) / 4)

  return {
    structure,
    kpiCompliance,
    clarity,
    executability,
    overall,
  }
}

function validatePromptStructure(prompt: string, module: any, options: TestOptions): ValidationResult {
  const issues: ValidationIssue[] = []

  const hasRequiredSections = prompt.includes("## CONTEXT") && prompt.includes("## OBJECTIVE")
  const hasValidKPIs = prompt.includes("## KPI") && prompt.includes(module?.kpi || "")
  const hasGuardrails = prompt.includes("## GUARDRAILS")
  const hasFailsafes = prompt.includes("FAIL-SAFES") || prompt.includes("Alternative")
  const isExecutable = prompt.includes("## NEXT ACTIONS") || prompt.includes("SPECIFICATIONS")

  if (!hasRequiredSections) {
    issues.push({
      type: "error",
      section: "Structure",
      message: "Missing required CONTEXT or OBJECTIVE sections",
      suggestion: "Add ## CONTEXT and ## OBJECTIVE sections",
    })
  }

  if (!hasValidKPIs) {
    issues.push({
      type: "warning",
      section: "KPI",
      message: "KPIs are not clearly defined or missing",
      suggestion: "Specify measurable metrics in ## KPI section",
    })
  }

  if (!hasGuardrails && options.checkGuardrails) {
    issues.push({
      type: "warning",
      section: "Safety",
      message: "Missing safety guardrails",
      suggestion: "Add ## GUARDRAILS section with constraints",
    })
  }

  if (!hasFailsafes) {
    issues.push({
      type: "info",
      section: "Resilience",
      message: "No fail-safes defined for error cases",
      suggestion: "Add alternatives for failure scenarios",
    })
  }

  if (!isExecutable) {
    issues.push({
      type: "error",
      section: "Execution",
      message: "Prompt does not contain clear execution instructions",
      suggestion: "Add ## NEXT ACTIONS section with concrete steps",
    })
  }

  return {
    hasRequiredSections,
    hasValidKPIs,
    hasGuardrails,
    hasFailsafes,
    isExecutable,
    issues,
  }
}

function generateRecommendations(scores: TestScores, validation: ValidationResult, options: TestOptions): string[] {
  const recommendations: string[] = []

  if (scores.structure < 80) {
    recommendations.push("Improve prompt structure with clearer sections")
  }

  if (scores.kpiCompliance < 85) {
    recommendations.push("Define more specific and measurable KPIs")
  }

  if (scores.clarity < 85) {
    recommendations.push("Add concrete examples for clarification")
  }

  if (scores.executability < 80) {
    recommendations.push("Specify implementation steps in more detail")
  }

  if (validation.issues.length > 2) {
    recommendations.push("Resolve identified validation issues")
  }

  if (scores.overall < 85) {
    recommendations.push("Consider optimization with GPT Editor for improvements")
  }

  // Add specific recommendations based on issues
  validation.issues.forEach((issue) => {
    if (issue.suggestion && !recommendations.includes(issue.suggestion)) {
      recommendations.push(issue.suggestion)
    }
  })

  return recommendations.slice(0, 5) // Limit to top 5 recommendations
}

function determineTestStatus(scores: TestScores, validation: ValidationResult): "success" | "warning" | "error" {
  const hasErrors = validation.issues.some((issue) => issue.type === "error")
  const hasWarnings = validation.issues.some((issue) => issue.type === "warning")

  if (hasErrors || scores.overall < 70) {
    return "error"
  }

  if (hasWarnings || scores.overall < 85) {
    return "warning"
  }

  return "success"
}

export function compareTestResults(results: TestResult[]): {
  bestResult: TestResult
  improvements: string[]
  trends: { metric: string; trend: "up" | "down" | "stable"; change: number }[]
} {
  if (results.length === 0) {
    throw new Error("No test results to compare")
  }

  const bestResult = results.reduce((best, current) => (current.scores.overall > best.scores.overall ? current : best))

  const improvements: string[] = []
  const trends: { metric: string; trend: "up" | "down" | "stable"; change: number }[] = []

  if (results.length > 1) {
    const latest = results[0]
    const previous = results[1]

    const structureChange = latest.scores.structure - previous.scores.structure
    const kpiChange = latest.scores.kpiCompliance - previous.scores.kpiCompliance
    const clarityChange = latest.scores.clarity - previous.scores.clarity
    const executabilityChange = latest.scores.executability - previous.scores.executability

    trends.push(
      {
        metric: "Structure",
        trend: structureChange > 2 ? "up" : structureChange < -2 ? "down" : "stable",
        change: structureChange,
      },
      {
        metric: "KPI Compliance",
        trend: kpiChange > 2 ? "up" : kpiChange < -2 ? "down" : "stable",
        change: kpiChange,
      },
      {
        metric: "Clarity",
        trend: clarityChange > 2 ? "up" : clarityChange < -2 ? "down" : "stable",
        change: clarityChange,
      },
      {
        metric: "Executability",
        trend: executabilityChange > 2 ? "up" : executabilityChange < -2 ? "down" : "stable",
        change: executabilityChange,
      },
    )

    if (structureChange > 5) improvements.push("Prompt structure improved significantly")
    if (kpiChange > 5) improvements.push("KPI compliance increased considerably")
    if (clarityChange > 5) improvements.push("Instruction clarity improved")
    if (executabilityChange > 5) improvements.push("Prompt executability increased")
  }

  return {
    bestResult,
    improvements,
    trends,
  }
}
