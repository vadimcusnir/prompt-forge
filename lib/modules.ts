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
