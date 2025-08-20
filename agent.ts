/**
 * agent.ts — Agentul Cursor pentru PROMPTFORGE™ v3.0
 * Nu devia de la LEGI. /cursor/init este sursa unică de adevăr.
 *
 * Rol:
 *  1) Încarcă /cursor/init (JSON fără extensie).
 *  2) Îngheață legile (non deviation laws) și ordinea de precedență.
 *  3) Permite doar operații whitelisted pe /cursor/docs/* conform init.
 *  4) Oprește orice acțiune prohibită și explică exact ce lege ar încălca.
 *  5) Aplică preflight validation și language policy enforcement.
 *  6) Validează și normalizează parametrii 7D conform ruleset.yml.
 */

import * as fs from "node:fs";
import * as path from "path";

type FileSpec = {
  path?: string;
  paths?: string[];
  role: string;
  interaction: "read_only" | "compile_apply" | "reference_apply" | "reference_generate";
  description?: string;
};

type CursorInit = {
  meta: { project: string; source_of_truth: string; last_updated: string };
  directories: {
    root: string;
    docs_root: string;
    docs_subfolders: string[];
  };
  precedence: {
    note: string;
    order: { id: string; path?: string; paths?: string[]; level: number }[];
  };
  language_policy?: {
    output_language: "en";
    translate_non_en_inputs: boolean;
    detect_languages: string[];
    fail_closed_on_detection_error: boolean;
    style_note?: string;
  };
  preflight?: {
    scan_globs: string[];
    must_exist_min: number;
    compile_rules_index: boolean;
    validate_sections: string[];
    abort_on_missing_or_conflict: boolean;
  };
  instruction_files: (FileSpec & { path: string })[];
  docs_routing: {
    write_allowed: string[];
    write_forbidden: string[];
    migrations_target: string;
    licensing_target: string;
    bundles_target: string;
  };
  sevenD_defaults: Record<string, string>;
  commands: Record<
    string,
    { uses: string[]; writes_to: string[]; pre_hooks?: string[] }
  >;
  non_deviation_laws: { id: number; text: string }[];
};

// ————————————————————————————————————————————————————————————————————————
// 7D ENGINE IMPLEMENTATION
// ————————————————————————————————————————————————————————————————————————

/**
 * 7D Parameters Interface - conform ruleset.yml
 */
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
 * 7D Validator Class
 */
export class SevenDValidator {
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
    const domain = params.domain || 'generic';
    
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
      scale: params.scale || domainDefaults.scale,
      urgency: params.urgency || domainDefaults.urgency,
      complexity: params.complexity || domainDefaults.complexity,
      resources: params.resources || domainDefaults.resources,
      application: params.application || domainDefaults.application,
      output: params.output || domainDefaults.output
    };
  }

  /**
   * Generates 7D signature for validation and chain compatibility
   */
  static generateSignature(params: SevenDParams): string {
    const signature = `${params.domain}|${params.scale}|${params.urgency}|${params.complexity}|${params.resources}|${params.application}|${params.output}`;
    return Buffer.from(signature).toString('base64');
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
}

const INIT_PATH = process.env.CURSOR_INIT_PATH || "/cursor/init";

// ————————————————————————————————————————————————————————————————————————
// UTILITARE LANGUAGE POLICY
// ————————————————————————————————————————————————————————————————————————
function isLikelyEnglish(s: string): boolean {
  // Heuristic simplu, fără dependențe: proporție ASCII + cuvinte frecvente EN
  const ascii = s.replace(/[^\x00-\x7F]/g, "").length / Math.max(1, s.length);
  const hits = (s.match(/\b(the|and|of|to|in|for|with|that|this|you)\b/gi) || []).length;
  return ascii > 0.9 && hits >= 2;
}

async function translateToEnglish(text: string): Promise<string> {
  // Stub: conectează la providerul tău (ex. OpenAI) sau alt serviciu,
  // menit exclusiv pentru traduceri; dacă nu este setat, returnează fallback.
  // Respectă „fail_closed_on_detection_error".
  return text; // TODO: înlocuiește cu apelul real
}

async function enforceEnglishOutput(text: string, policy: CursorInit["language_policy"]): Promise<string> {
  if (!policy || policy.output_language !== "en") return text;
  if (isLikelyEnglish(text)) return text;
  if (!policy.translate_non_en_inputs) throw new Error("LANG_POLICY: Non-English input and translation disabled.");
  const t = await translateToEnglish(text);
  if (!isLikelyEnglish(t) && policy.fail_closed_on_detection_error) {
    throw new Error("LANG_POLICY: Translation/detection failed hard-close.");
  }
  return t;
}

// ————————————————————————————————————————————————————————————————————————
// UTILITARE PREFLIGHT VALIDATION
// ————————————————————————————————————————————————————————————————————————
function readText(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function validateRuleSections(text: string, sections: string[]): string[] {
  const miss: string[] = [];
  for (const sec of sections) {
    if (!text.toLowerCase().includes(sec.toLowerCase())) miss.push(sec);
  }
  return miss;
}

function preflightRules(init: CursorInit) {
  const pf = init.preflight;
  if (!pf) return;
  
  // Scan for forge_v3_* files
  const files: string[] = [];
  for (const globPattern of pf.scan_globs) {
    try {
      // Simple glob pattern matching without external dependencies
      const pattern = globPattern.replace(/\*/g, ".*");
      const regex = new RegExp(pattern);
      const cursorDir = path.resolve("/cursor");
      if (fs.existsSync(cursorDir)) {
        const items = fs.readdirSync(cursorDir);
        for (const item of items) {
          if (regex.test(item)) {
            const fullPath = path.join(cursorDir, item);
            if (fs.statSync(fullPath).isFile()) {
              files.push(fullPath);
            }
          }
        }
      }
    } catch (e) {
      // Continue with other patterns if one fails
      console.warn(`[PREFLIGHT] Failed to scan pattern ${globPattern}:`, e);
    }
  }
  
  if (files.length < (pf.must_exist_min || 0)) {
    if (pf.abort_on_missing_or_conflict) {
      throw new Error(`PREFLIGHT: Missing forge_v3_* files. Found: ${files.length}, Required: ${pf.must_exist_min}`);
    }
  }
  
  if (pf.compile_rules_index || pf.validate_sections?.length) {
    const problems: Array<{ file: string; missing: string[] }> = [];
    for (const f of files) {
      const t = readText(f);
      if (!t) continue;
      if (pf.validate_sections?.length) {
        const miss = validateRuleSections(t, pf.validate_sections);
        if (miss.length) problems.push({ file: f, missing: miss });
      }
    }
    if (problems.length && pf.abort_on_missing_or_conflict) {
      throw new Error("PREFLIGHT: Rule sections missing — " + JSON.stringify(problems));
    }
  }
}

// ————————————————————————————————————————————————————————————————————————
// HOOK-URI COMUNE
// ————————————————————————————————————————————————————————————————————————
async function runWithGuards(commandName: string, payload: { draft?: string; sevenD?: Partial<SevenDParams> }, init: CursorInit) {
  // Non-deviation + preflight reguli
  preflightRules(init);

  // 7D Validation - mandatory for all operations
  let sevenDParams: SevenDParams | null = null;
  if (payload.sevenD) {
    try {
      sevenDParams = SevenDValidator.validate(payload.sevenD);
    } catch (error) {
      throw new Error(`7D validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    // Use defaults from init if no 7D provided
    sevenDParams = SevenDValidator.normalizeWithDefaults(init.sevenD_defaults);
  }

  // English-only: aplică pe input și pe output
  const draft = payload.draft ?? "";
  const enforcedInput = await enforceEnglishOutput(draft, init.language_policy);

  // TODO: Implement executeCommand function with 7D integration
  // const result = await executeCommand(commandName, { ...payload, draft: enforcedInput, sevenD: sevenDParams });
  // result.output = await enforceEnglishOutput(result.output ?? "", init.language_policy);
  // return result;
  
  // Placeholder return for now
  return {
    input: enforcedInput,
    output: enforcedInput,
    command: commandName,
    status: "guarded",
    sevenD: sevenDParams,
    signature: SevenDValidator.generateSignature(sevenDParams),
    recommendations: SevenDValidator.getDomainRecommendations(sevenDParams)
  };
}

// ————————————————————————————————————————————————————————————————————————
// Utilitare
// ————————————————————————————————————————————————————————————————————————
function assert(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(`[AGENT] ${msg}`);
}

function readInit(p: string): CursorInit {
  const abs = path.resolve(p);
  assert(fs.existsSync(abs), `Nu găsesc init la: ${abs}`);
  const raw = fs.readFileSync(abs, "utf8").trim();
  try {
    const parsed = JSON.parse(raw) as CursorInit;
    return parsed;
  } catch (e) {
    throw new Error(`[AGENT] /cursor/init nu este JSON valid. ${String(e)}`);
  }
}

function isUnderDir(candidate: string, baseDir: string): boolean {
  const rel = path.relative(baseDir, candidate);
  return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

function arrayify<T>(x?: T | T[]): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

// ————————————————————————————————————————————————————————————————————————
// ÎNCĂRCARE CONFIG + LEGI
// ————————————————————————————————————————————————————————————————————————
const INIT = readInit(INIT_PATH);

// indexuri rapide
const READ_ONLY = new Set(
  INIT.precedence.order
    .flatMap(o => arrayify(o.path ?? o.paths))
    .filter(Boolean) as string[]
);

const WRITE_ALLOWED = new Set(INIT.docs_routing.write_allowed);
const WRITE_FORBIDDEN = new Set(INIT.docs_routing.write_forbidden);
const DOCS_ROOT = INIT.directories.docs_root;

const LAWS = Object.freeze(INIT.non_deviation_laws.map(l => ({ ...l })));

// ————————————————————————————————————————————————————————————————————————
// VERIFICATOR DE ACȚIUNI
// ————————————————————————————————————————————————————————————————————————
type Action =
  | { kind: "READ"; target: string }
  | { kind: "WRITE"; target: string }
  | { kind: "DELETE"; target: string }
  | { kind: "GENERATE"; targetDir: string; sevenD?: Partial<SevenDParams> }
  | { kind: "MIGRATE"; targetDir?: string }
  | { kind: "LICENSE_CHECK" }
  | { kind: "EXPORT"; targetDir: string; sevenD?: Partial<SevenDParams> };

type Verdict = { allowed: true } | { allowed: false; violatedLaw: number; reason: string };

function forbid(violatedLaw: number, reason: string): Verdict {
  return { allowed: false, violatedLaw, reason };
}

function check(action: Action): Verdict {
  switch (action.kind) {
    case "READ": {
      // Legea 1 & 5: folosește doar ce este enumerat; init definește scope
      const t = path.resolve(action.target);
      if (!t.startsWith(INIT.directories.root)) {
        return forbid(3, `Acces înafara /cursor: ${t}`);
      }
      return { allowed: true };
    }

    case "WRITE":
    case "DELETE": {
      const t = path.resolve(action.target);

      // Legea 2: read_only blocat
      if (READ_ONLY.has(t)) {
        return forbid(2, `Fișier protejat (read_only): ${t}`);
      }

      // Legea 3: scriere doar sub /cursor/docs și doar în foldere permise
      if (!isUnderDir(t, DOCS_ROOT)) {
        return forbid(3, `Scriere permisă doar sub ${DOCS_ROOT}`);
      }
      for (const f of Array.from(WRITE_FORBIDDEN)) {
        if (t === path.resolve(f)) {
          return forbid(2, `Țintă interzisă: ${t}`);
        }
      }
      // trebuie să fie într-un folder whitelisted
      const inAllowed = Array.from(WRITE_ALLOWED).some(dir => isUnderDir(t, path.resolve(dir)) || path.resolve(dir) === t);
      if (!inAllowed) {
        return forbid(3, `Folder nepermis pentru scriere: ${t}`);
      }
      return { allowed: true };
    }

    case "GENERATE": {
      const dir = path.resolve(action.targetDir);
      if (!isUnderDir(dir, DOCS_ROOT)) {
        return forbid(3, `Generare permisă doar sub ${DOCS_ROOT}`);
      }
      const inAllowed = Array.from(WRITE_ALLOWED).some(d => isUnderDir(dir, path.resolve(d)) || path.resolve(d) === dir);
      if (!inAllowed) {
        return forbid(3, `Folder țintă nepermis pentru generare: ${dir}`);
      }
      // Legea 10: trebuie set 7D; aici doar semnalăm — sistemul care apelează agentul trebuie să injecteze 7D
      if (!action.sevenD) {
        return forbid(10, `7D parameters are mandatory for generation; otherwise the artifact is invalid`);
      }
      return { allowed: true };
    }

    case "MIGRATE": {
      const dir = path.resolve(action.targetDir ?? INIT.docs_routing.migrations_target);
      const expected = path.resolve(INIT.docs_routing.migrations_target);
      if (dir !== expected) {
        return forbid(8, `Migrațiile se emit doar în ${expected}`);
      }
      return { allowed: true };
    }

    case "LICENSE_CHECK": {
      // Legea 7: obligatoriu să se treacă prin entitlements
      const ent = path.resolve("/cursor/forge_v3_standard_entitlements.txt");
      if (!fs.existsSync(ent)) {
        return forbid(7, `Nu găsesc entitlements la ${ent}`);
      }
      return { allowed: true };
    }

    case "EXPORT": {
      const dir = path.resolve(action.targetDir);
      const bundles = path.resolve(INIT.docs_routing.bundles_target);
      if (dir !== bundles) {
        return forbid(1, `Exportul de bundle este permis doar în ${bundles}`);
      }
      // Legea 10: 7D parameters mandatory for export
      if (!action.sevenD) {
        return forbid(10, `7D parameters are mandatory for export; otherwise the artifact is invalid`);
      }
      return { allowed: true };
    }

    default:
      return forbid(5, `Acțiune necunoscută sau neacoperită de init.`);
  }
}

// ————————————————————————————————————————————————————————————————————————
// INTERFAȚA AGENTULUI
// ————————————————————————————————————————————————————————————————————————
export const CursorAgent = {
  info() {
    return {
      project: INIT.meta.project,
      source_of_truth: INIT.meta.source_of_truth,
      laws: LAWS.map(l => `${l.id}. ${l.text}`),
      docs_root: INIT.directories.docs_root,
      write_allowed: Array.from(WRITE_ALLOWED),
      precedence: INIT.precedence.order
        .slice()
        .sort((a, b) => a.level - b.level)
        .map(o => ({ id: o.id, level: o.level, paths: arrayify(o.path ?? o.paths) })),
      language_policy: INIT.language_policy,
      preflight: INIT.preflight,
      sevenD: {
        enums: SEVEN_D_ENUMS,
        defaults: INIT.sevenD_defaults,
        domainDefaults: DOMAIN_DEFAULTS
      }
    };
  },

  /**
   * Apel standard pentru orice operație. Îți returnează verdictul și motivul blocării (dacă e cazul).
   */
  guard(action: Action): Verdict {
    return check(action);
  },

  /**
   * Hook pentru preflight validation
   */
  preflight(): void {
    preflightRules(INIT);
  },

  /**
   * Hook pentru language detection
   */
  detectLanguage(text: string): boolean {
    return isLikelyEnglish(text);
  },

  /**
   * Hook pentru language enforcement
   */
  async enforceLanguage(text: string): Promise<string> {
    return enforceEnglishOutput(text, INIT.language_policy);
  },

  /**
   * Hook comun pentru rularea cu guard-uri
   */
  async runWithGuards(commandName: string, payload: { draft?: string; sevenD?: Partial<SevenDParams> }) {
    return runWithGuards(commandName, payload, INIT);
  },

  /**
   * 7D Validation and normalization
   */
  validateSevenD(params: Partial<SevenDParams>): SevenDParams {
    return SevenDValidator.validate(params);
  },

  /**
   * 7D Normalization with defaults
   */
  normalizeSevenD(params: Partial<SevenDParams>): SevenDParams {
    return SevenDValidator.normalizeWithDefaults(params);
  },

  /**
   * Generate 7D signature for validation
   */
  generateSevenDSignature(params: SevenDParams): string {
    return SevenDValidator.generateSignature(params);
  },

  /**
   * Get domain-specific recommendations
   */
  getSevenDRecommendations(params: SevenDParams): string[] {
    return SevenDValidator.getDomainRecommendations(params);
  },

  /**
   * Prompt de sistem pentru LLM-urile din Cursor.
   * Îl poți injecta în orice chain. E non‑negociabil.
   */
  systemPrompt(): string {
    return [
      "Ești Agentul Cursor al PROMPTFORGE™ v3.0.",
      "Respectă STRICT ierarhia și legile din /cursor/init.",
      "Nu promite execuții viitoare. Livrează acum, în aceeași rulare.",
      "Nu modifica fișiere read_only. Scrie doar în folderele whitelisted din /cursor/docs.",
      "Aplică branding-ul la export și validează entitlements înainte de funcții gated.",
      "Fiecare generare trebuie parametrizată cu engine-ul 7D (domain, scale, urgency, complexity, resources, application, output).",
      "7D parameters sunt obligatorii: domain (FIN/ECOM/EDU/SAAS/HEALTH/LEGAL/GOV/MEDIA), scale (solo/team/org/market), urgency (low/normal/high/crisis), complexity (low/medium/high), resources (minimal/standard/extended), application (content_ops/sales_ops/product_ops/research/crisis_ops), output (text/sop/plan/bundle).",
      "Dacă o cerință contrazice legile, oprește-te și explică ce lege ar fi încălcată.",
      "Respectă politica de limbă: output-ul trebuie să fie în engleză.",
      "Validează preflight regulile înainte de orice operație.",
      "Nu improviza: respectă strict DoR/DoD gates și 7D validation."
    ].join(" ");
  }
};

// ————————————————————————————————————————————————————————————————————————
// Exemplu rapid (comentat). Decomentează în dev ca să testezi.
// ————————————————————————————————————————————————————————————————————————
// const verdict = CursorAgent.guard({ kind: "GENERATE", targetDir: "/cursor/docs/industry_packs_bundle", sevenD: { domain: 'FIN', scale: 'team' } });
// console.log(verdict);
// 
// // Test preflight
// try {
//   CursorAgent.preflight();
//   console.log("✅ Preflight passed");
// } catch (e) {
//   console.error("❌ Preflight failed:", e);
// }
// 
// // Test 7D validation
// try {
//   const sevenD = CursorAgent.validateSevenD({ domain: 'FIN', scale: 'team' });
//   console.log("✅ 7D validation passed:", sevenD);
//   console.log("🔑 Signature:", CursorAgent.generateSevenDSignature(sevenD));
//   console.log("💡 Recommendations:", CursorAgent.getSevenDRecommendations(sevenD));
// } catch (e) {
//   console.error("❌ 7D validation failed:", e);
// }
// 
// // Test language detection
// console.log("EN:", CursorAgent.detectLanguage("This is English text"));
// console.log("RO:", CursorAgent.detectLanguage("Acesta este text în română"));
