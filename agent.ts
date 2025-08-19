/**
 * agent.ts — Agentul Cursor pentru PROMPTFORGE™ v3.0
 * Nu devia de la LEGI. /cursor/init este sursa unică de adevăr.
 *
 * Rol:
 *  1) Încarcă /cursor/init (JSON fără extensie).
 *  2) Îngheață legile (non deviation laws) și ordinea de precedență.
 *  3) Permite doar operații whitelisted pe /cursor/docs/* conform init.
 *  4) Oprește orice acțiune prohibită și explică exact ce lege ar încălca.
 */

import * as fs from "node:fs";
import * as path from "node:path";

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
    { uses: string[]; writes_to: string[] }
  >;
  non_deviation_laws: { id: number; text: string }[];
};

const INIT_PATH = process.env.CURSOR_INIT_PATH || "/cursor/init";

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
  | { kind: "GENERATE"; targetDir: string }
  | { kind: "MIGRATE"; targetDir?: string }
  | { kind: "LICENSE_CHECK" }
  | { kind: "EXPORT"; targetDir: string };

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
      for (const f of WRITE_FORBIDDEN) {
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
        .map(o => ({ id: o.id, level: o.level, paths: arrayify(o.path ?? o.paths) }))
    };
  },

  /**
   * Apel standard pentru orice operație. Îți returnează verdictul și motivul blocării (dacă e cazul).
   */
  guard(action: Action): Verdict {
    return check(action);
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
      "Dacă o cerință contrazice legile, oprește-te și explică ce lege ar fi încălcată."
    ].join(" ");
  }
};

// ————————————————————————————————————————————————————————————————————————
// Exemplu rapid (comentat). Decomentează în dev ca să testezi.
// ————————————————————————————————————————————————————————————————————————
// const verdict = CursorAgent.guard({ kind: "GENERATE", targetDir: "/cursor/docs/industry_packs_bundle" });
// console.log(verdict);
