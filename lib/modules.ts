import type { PromptModule } from "@/types/promptforge"

export const MODULES: Record<number, PromptModule> = {
  1: {
    id: 1,
    name: "AI-IDEI.SOPFORGE",
    description: "Pipeline multi-agent research validation SOP cu telemetrie",
    requirements: "[SUBIECT], [NIVEL], [CONTEXT], [FORMAT], [LIMBA], [DEADLINE], [BUDGET], 6+ surse cu autor+data",
    spec: "Proces 4-agenti: SourceMiner ConflictResolver ProcedureBuilder QAPilot",
    output: "{goal,scope,roles,tools,steps,risks,fallbacks,checklist,sources}",
    kpi: "TTI, steps_passed, coverage surse, defect rate <2%",
    guardrails: "no guesswork, citeaza oficial",
    vectors: [1, 6, 5],
  },
  2: {
    id: 2,
    name: "AI-IDEI.LATENTMAP",
    description: "Mapeaza corpus si deriva traiectorii latente",
    requirements: "[CORPUS_PATHS], [HORIZON_DAYS], [DEPTH], anti_surface=true",
    spec: "Embeddings multi-scale + topic mining + dependency graph",
    output: "{latent_graph, motifs, strategies, trajectories, actions}",
    kpi: "modularity>0.35, NMI pe validare >0.6",
    guardrails: "test out-of-domain; fallback interpretabil",
    vectors: [2, 5],
  },
  3: {
    id: 3,
    name: "Codul 7:1",
    description: "Generator campanii end-to-end cu KPI",
    requirements: "[PRODUS], [AVATAR], [OBIECTIV], [BUGET], [KPI]",
    spec: "Pipeline 7 etape la 1 verdict comercial",
    output: "{wound,paradox,strip,unpacking,psych_funnel,metaphor,verdict,assets,tests}",
    kpi: "uplift CR target +15%",
    guardrails: "fara promisiuni nerealiste; probe sociale atasate",
    vectors: [2, 6],
  },
  4: {
    id: 4,
    name: "Dictionarul Semiotic 8VULTUS",
    description: "Invocabil in GPT + teste memetice",
    requirements: "[BRAND_SYSTEM], [SYMBOL_SET], [DOMENIU]",
    spec: "Mapare simbol la functie retorica la exemple validabile",
    output: "{symbol,meaning,do_say,dont_say,memetic_tests}",
    kpi: "recall semnificare >90%",
    guardrails: "coerenta inter-document",
    vectors: [2, 5],
  },
  5: {
    id: 5,
    name: "ORAKON Memory Grid",
    description: "Memorie stratificata + politici de uitare controlata",
    requirements: "[LAYERS:{core,project,session,ephemeral}], [TTL], [RETENTION_POLICY]",
    spec: "Rules: ce intra in fiecare layer; LRU + TTL",
    output: "{write_rules,read_rules,forget_rules,compaction_jobs}",
    kpi: "hit-rate >70%, leak=0",
    guardrails: "PII hashing",
    vectors: [4, 5],
  },
  6: {
    id: 6,
    name: "Agentic GPT Sales",
    description: "Pipeline de vânzări cu AI agents pentru lead qualification",
    requirements: "[PRODUCT], [TARGET_AUDIENCE], [SALES_CYCLE], [KPIS]",
    spec: "Multi-agent system: Qualifier, Nurturer, Closer, Objection Handler",
    output: "{sales_script,qualification_questions,nurture_sequence,objection_responses}",
    kpi: "conversion rate +25%, sales cycle -30%",
    guardrails: "no aggressive tactics, respect GDPR",
    vectors: [2, 4],
  },
  7: {
    id: 7,
    name: "Risk & Trust Reversal",
    description: "Arhitectură de garanții cuantificate pentru oferte high-ticket",
    requirements: "[PRICE], [PERCEIVED_RISK], [PROOFS], [GUARANTEES]",
    spec: "Guarantee stack + proof points + risk mitigation",
    output: "{claims,proofs,guarantees,terms,faq}",
    kpi: "trust score ≥85%, conversion +40%",
    guardrails: "no unfounded claims, privacy safe",
    vectors: [2, 4],
  },
  8: {
    id: 8,
    name: "Content Velocity Engine",
    description: "Generator de conținut cu template-uri și KPI tracking",
    requirements: "[CONTENT_TYPE], [BRAND_VOICE], [TARGET_AUDIENCE], [KPIS]",
    spec: "Template system + AI generation + performance analytics",
    output: "{content_templates,generation_prompts,performance_metrics}",
    kpi: "content production +300%, engagement +25%",
    guardrails: "brand consistency, no plagiarism",
    vectors: [3, 5],
  },
  9: {
    id: 9,
    name: "Prompt Engineering Framework",
    description: "Sistem de inginerie a prompturilor cu validare și optimizare",
    requirements: "[USE_CASE], [TARGET_MODEL], [CONSTRAINTS], [EXPECTED_OUTPUT]",
    spec: "Prompt design + validation + optimization + testing",
    output: "{prompt_template,validation_rules,optimization_guide,test_cases}",
    kpi: "prompt effectiveness +50%, consistency +80%",
    guardrails: "no harmful content, respect model limits",
    vectors: [1, 6],
  },
  10: {
    id: 10,
    name: "Brand Architecture System",
    description: "Sistem de arhitectură de brand cu semiotic și validare",
    requirements: "[BRAND_VALUES], [TARGET_AUDIENCE], [MARKET_POSITION], [VISUAL_IDENTITY]",
    spec: "Brand strategy + visual identity + messaging framework",
    output: "{brand_guidelines,visual_elements,messaging_framework,implementation_guide}",
    kpi: "brand recognition +35%, consistency +90%",
    guardrails: "trademark compliance, cultural sensitivity",
    vectors: [5, 2],
  },
  11: {
    id: 11,
    name: "Data Storytelling Engine",
    description: "Transformă date în narative captivante cu insights acționabile",
    requirements: "[DATASET], [AUDIENCE], [OBJECTIVE], [FORMAT]",
    spec: "Data analysis + narrative structure + visualization",
    output: "{data_story,insights,visualizations,action_items}",
    kpi: "comprehension +60%, action rate +45%",
    guardrails: "data accuracy, no manipulation",
    vectors: [6, 3],
  },
  12: {
    id: 12,
    name: "Crisis Communication Protocol",
    description: "Protocol de comunicare în criză cu response templates",
    requirements: "[CRISIS_TYPE], [STAKEHOLDERS], [TIMELINE], [COMMUNICATION_CHANNELS]",
    spec: "Crisis assessment + response strategy + communication plan",
    output: "{crisis_assessment,response_templates,communication_plan,escalation_protocol}",
    kpi: "response time <2h, stakeholder satisfaction ≥80%",
    guardrails: "truthful communication, legal compliance",
    vectors: [7, 4],
  },
}

export function getModulesByVector(vectorId: number): PromptModule[] {
  return Object.values(MODULES).filter((module) => module.vectors.includes(vectorId))
}

export function searchModules(query: string): PromptModule[] {
  const searchTerm = query.toLowerCase()
  return Object.values(MODULES).filter(
    (module) =>
      module.name.toLowerCase().includes(searchTerm) ||
      module.description.toLowerCase().includes(searchTerm) ||
      module.kpi.toLowerCase().includes(searchTerm),
  )
}

export function getModuleStats() {
  const vectorCounts = Object.values(MODULES).reduce(
    (acc, module) => {
      module.vectors.forEach((vector) => {
        acc[vector] = (acc[vector] || 0) + 1
      })
      return acc
    },
    {} as Record<number, number>,
  )

  return {
    totalModules: Object.keys(MODULES).length,
    vectorDistribution: vectorCounts,
    mostPopularVector: Object.entries(vectorCounts).reduce((a, b) =>
      vectorCounts[Number.parseInt(a[0])] > vectorCounts[Number.parseInt(b[0])] ? a : b,
    )[0],
  }
}
