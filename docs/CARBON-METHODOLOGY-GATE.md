# NIRDHOOM Carbon Methodology Gate

## Purpose

NIRDHOOM may maintain **carbon-accounting readiness**, but the application must not describe an internal evidence record as a carbon credit, registry certificate, VCU, retirement, or verified removal.

## Current reference

As of October 2026, Verra lists **VM0042 Improved Agricultural Land Management v2.2** as active. It covers improved agricultural land management practices including residue management and quantifies GHG emission reductions and soil organic carbon (SOC) removals. Verra also issued corrections and clarifications for v2.2 effective June 11, 2026.

Primary references:

- https://verra.org/methodologies/vm0042-improved-agricultural-land-management-v2-2/
- https://verra.org/program-notice/corrections-and-clarifications-to-ialm-methodology-vm0042/
- https://verra.org/methodologies-main/frequently-asked-questions-vm0042/

## Product implications

NIRDHOOM should preserve these layers separately:

1. **Operational evidence** — field provenance, booking, machine/job history, GPS, photos, weighment and residue lot.
2. **Remote-sensing evidence** — FIRMS/VIIRS observations and any future optical burn-scar analysis, with acquisition time and source.
3. **Verification decision** — human reviewer, decision, confidence, reason and appeal/override history.
4. **Impact accounting** — methodology, baseline, activity data, emission/removal factors, uncertainty and calculation version.
5. **Registry status** — a separate external state. NIRDHOOM must never infer it from a local verification row.

## Measurement gate

A field becoming `VERIFIED_NON_BURN` is **not** a carbon-credit issuance event.

For any future VM0042 project, the project team must establish the applicable quantification approach, eligibility area, baseline and additionality evidence, monitoring design, uncertainty treatment, required sampling/measurements, QA/QC, validation/verification and registry process.

Verra's current guidance also makes clear that project-specific SOC measurements used for verification must satisfy methodology requirements; shallow government soil measurements cannot simply be treated as compliant ex-post SOC measurements.

## UI rules

Never use:

- "issued carbon credit"
- "verified carbon credit"
- "Verra certificate"
- "VCU"
- "retired credit"
- "guaranteed carbon value"

unless an external registry/provider record actually exists and is linked to the NIRDHOOM evidence chain.

Allowed language:

- "carbon-accounting readiness"
- "illustrative methodology record"
- "evidence package"
- "candidate impact record"
- "methodology gate pending"

## Current release boundary

Payment is simulated. Carbon registry connectivity is not configured. Buyer offers are not contracts until commercial terms are executed. Public/state statistics are context and must never be reported as NIRDHOOM outcomes.

Last reviewed: 2026-10-05.
