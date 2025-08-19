export interface PromptModule {
  id: number
  name: string
  description: string
  requirements: string
  spec: string
  output: string
  kpi: string
  guardrails: string
  vectors: number[]
}

export interface SessionConfig {
  vector: string
  domain: string
  scale: string
  urgency: string
  resources: string
  complexity: string
  application: string
  outputFormat: string
  output?: string // Pentru export bundle
}

export interface GeneratedPrompt {
  id: string
  hash: string
  timestamp: Date
  config: SessionConfig
  moduleId: number
  prompt: string
  editedPrompt?: string
  testResults?: TestResults
}

export interface TestResults {
  structureScore: number
  kpiScore: number
  clarityScore: number
  output: string
  validated: boolean
}

export interface PromptHistory {
  prompts: GeneratedPrompt[]
  maxEntries: number
}

export const VECTORS = {
  1: { name: "V1: Systems & Agents", color: "text-red-400" },
  2: { name: "V2: Marketing & Sales", color: "text-blue-400" },
  3: { name: "V3: Content & Education", color: "text-green-400" },
  4: { name: "V4: Decisions & Cognitive", color: "text-yellow-400" },
  5: { name: "V5: Semiotic Branding", color: "text-purple-400" },
  6: { name: "V6: Data & Analytics", color: "text-cyan-400" },
  7: { name: "V7: Crisis & PR", color: "text-orange-400" },
} as const
