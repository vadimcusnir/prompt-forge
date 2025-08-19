# Industry Packs (PROMPTFORGE v3)
Generated: 2025-08-19T00:01:38.735482Z

Files:
- `schema.industry-pack.json` — canonical schema
- `fintech.json` — FinTech Pack (Pro/Enterprise only; audit-grade exports .spec + .json)
- `ecommerce.json` — E‑Commerce Pack (Pro/Enterprise; playbook + checklist)
- `education.json` — Education Pack (Pro/Enterprise; playbook + spec)

Import into Supabase:
1) Create `industry_packs` rows from these JSONs (one row per pack).
2) Gate usage via `org_industry_packs` and plan entitlements.
3) Enforce price floor via Stripe config and webhook policy.
