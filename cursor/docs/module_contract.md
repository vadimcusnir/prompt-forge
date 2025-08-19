# Contract de Modul PROMPTFORGE™ (valabil M01–M50)

## Obiectiv
Fiecare modul primește un context 7D + inputuri specifice și livrează un artefact executabil (spec/playbook/json/diagram/bundle), cu KPI măsurabili, guardrails și dependențe clare.

## Câmpuri canonice
- module_id — ex: "M07"
- name — scurt, operativ
- vectors — int[] 1..7 (Strategic, Retoric, Conținut, Cognitiv, Memetic, Date, Criză)
- purpose — scop în 1–2 fraze
- inputs
  - parameter_set_7d — {domain, scale, urgency, complexity, resources, application, output_format}
  - module_params — chei specifice modulului
  - context_assets — opțional (brief, CSV/JSON, URL, text)
- process
  - steps[] — pași logici (prompt flow)
  - eval_hooks[] — verificări (clarity, execution, policy)
  - post_ops[] — formatare, rezumare, bundling
- outputs
  - primary {type, schema} — artefactul principal
  - secondary[] — artefacte suplimentare (checklist, json, diagram)
- kpi
  - definition[] — indicatori + formule
  - targets — ținte implicite per‑domain (override‑abile)
  - measurement — cum se măsoară (telemetry → prompt_scores)
- guardrails
  - policy — reguli (GDPR, IP, domain compliance)
  - style — ton/stil (bias per domain)
  - constraints — limite (tokens, temperature, interdicții)
  - fallbacks — plan de rezervă
- dependencies
  - internal — domain_configs, evaluators, templates, taxonomii
  - external — API‑uri/standarde (Stripe/Supabase/Jira/GA4/ISO/PCI/WCAG etc.)
- telemetry
  - run_meta — model, tokens, cost, durată
  - policy_hits — reguli aplicate
  - scores — clarity/execution/ambiguity/alignment/business_fit
- export
  - formats[] — md/json/pdf/bundle
  - structure — layout + naming + checksum

## Pipeline (state machine)
validate_7d → normalize_inputs → plan → generate → evaluate → repair → format → export → log
