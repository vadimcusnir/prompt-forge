# M07 — Risk & Trust Reversal (FinTech)

## Purpose
Reduce riscul perceput și obiecțiile prin garanții, dovezi și recadre identitare. Ținta: scădere drop‑off pe pasul critic din funnel.

## Inputs
- parameter_set_7d: {"domain":"fintech","scale":"enterprise","urgency":"sprint","complexity":"advanced","resources":"full_stack_org","application":"implementation","output_format":"spec"}
- module_params:
  - offer_profile: {price, terms, refund, trial, compliance_notes}
  - objections_top: [listă clasată]
  - proof_assets: [testimoniale, studii, audit extern]
  - risk_matrix: {legal, financiar, reputațional, operațional}
- context_assets: opțional (linkuri, politici, rapoarte)

## Process (steps)
1) Map obiecții → tip de risc (legal/fin/reputațional/exec)
2) Propune 3–5 mecanisme reversare (garanții, escrow, milestones, SLA)
3) Re‑scrie promisiunea în 2 registre (conservator & ofensiv)
4) Montează dovada (case study, standarde, audit)
5) Validare compliance (AML/KYC/PCI; fără promisiuni nereglementate)
6) Formatare artefacte: spec + checklist.md + offer_terms.json

## Output (primary: spec)
### 1. Context
### 2. Risk Map (legal/fin/reputațional/exec)
### 3. Trust Devices (garanții, escrow, milestones, SLA)
### 4. Terms & SLA (limite, timpi, responsabilități)
### 5. Proof Set (studii, audit, certificări)
### 6. Compliance Fit (AML/KYC/PCI/PSD2)
### 7. Roll‑out Plan (pași, owneri, timeline)

## Secondary
- checklist.md
- offer_terms.json

## KPI
- dropoff_delta: % scădere în pasul critic (A/B)
- approval_rate: % lead‑uri approve (KYC/credit)
- time_to_decision: medie până la accept
**Targets**: dropoff_delta ≤ -25%, approval_rate +10%, time_to_decision -20%
**Measurement**: înainte/după în 14 zile; Evaluator AI ≥ 85/100

## Guardrails
- Policy: fără afirmații financiare nereglementate; disclaimere; respect PCI/PSD2
- Style: audit‑like, autoritar, clar
- Constraints: temperature ≤ 0.4, max_tokens 7000
- Fallbacks: dacă lipsesc dovezi → cere assets min.; dacă compliance flag → blochează promisiunea

## Dependencies
- internal: domain_configs(fintech), evaluator_ai, templates/spec_v2
- external: PCI DSS ref, PSD2 SCA checklist

## Telemetry & Export
- Log: tokens, cost, duration; prompt_scores (clarity/execution/alignment/business_fit)
- Export: md/json/pdf + checksum
- Bundle path: /bundles/fintech/M07/...
