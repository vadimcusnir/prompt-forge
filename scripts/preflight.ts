import fs from "fs";
const mustHave = [
  "cursor/init", "cursor/agent.ts", "ruleset.yml",
  "db/schema.sql", ".cursor/rules/00-foundation.mdc"
];
const allowedRoots = new Set(["app","components","lib","cursor","db",".github","types","public",".env.example","README.md","ruleset.yml"]);

let ok = true;
for (const p of mustHave) if (!fs.existsSync(p)) { console.error("MISSING:", p); ok = false; }
for (const p of fs.readdirSync(".")) if (!allowedRoots.has(p)) { console.error("FORBIDDEN_PATH:", p); ok = false; }
if (!ok) { process.exit(2); }
console.log("Preflight OK");
