# NIRDHOOM — Product Roadmap, October 2026

## Evidence

Recent ICAR and government planning point toward a coordinated crop-residue operating problem: machine capacity, field timing, aggregation, storage, transport and assured offtake. ICAR's September 2026 Punjab workshop specifically called for district-level machine-demand matching, digital mapping, better CHC coordination and expanded baler tracking. The 2026-27 national plan targets 46,000+ CRM machines, 910 CHCs and 141 stubble supply-chain projects.

## Product thesis

NIRDHOOM should be the **field-to-offtake operating layer**:

**Field readiness → machine capacity → dispatch → evidence → verified lot → storage → buyer requirement → transport → delivery evidence.**

Do not turn it into a generic social network, generic AI assistant, carbon-credit registry, payment wallet or broad marketplace.

## Next priorities

### 1. Capacity matching
Score candidate machines by residue compatibility, implement/tractor capability, current status, assignment load, distance, field deadline and operating constraints. Recommendations remain proposals until authorized confirmation.

### 2. 24–72 hour harvest planning
Show expected harvest windows, clearance deadlines, machine capacity, unassigned fields, verified residue, yard capacity and buyer demand on one timeline. The key question is: **where will capacity be short next?**

### 3. Bale and storage chain
Trace every verified lot through:

**field → baling → bale/lot ID → weighment → yard → transport → offtake receipt.**

Track verified tonnes, moisture, quality, bale type, readiness, pickup deadline, yard occupancy, destination and delivery evidence.

### 4. Buyer demand
Buyer records should include residue type, moisture ceiling, quality constraints, quantity, pickup window, destination and counterparty verification state.

Coverage must be based only on lots actually assigned/committed to that buyer. Unallocated verified residue is supply, not buyer coverage.

### 5. Farmer access
Keep the farmer path short:

1. My fields
2. Book clearance
3. Track machine
4. Verify work
5. Residue status

Telegram should mirror these actions.

### 6. Evidence and trust
Retain operator GPS, evidence asset, timestamp, authenticated job, verified residue and provenance. Remote sensing remains supporting evidence; missing fire observations must never be presented as proof that burning did not occur.

### 7. Operational KPIs
Prioritize:
- fields cleared before deadline
- machine utilization
- average dispatch distance
- verified tonnes
- tonnes awaiting weighment
- tonnes awaiting pickup
- yard occupancy
- committed buyer coverage
- delivery completion
- exception resolution time

Avoid vanity metrics and carbon claims until the underlying chain is independently verified.

## Delivery phases

**Prototype hardening:** validation, demo/live separation, image/performance QA, responsive/accessibility QA, correct buyer coverage, capability-aware dispatch.

**Pilot:** one district, selected CHCs/operators, real field geometry, telemetry, weighment, supervised pickup jobs and one or two real offtake counterparties.

**Network operations:** district heatmap, 24–72 hour capacity forecast, bale/yard ledger, transport planning, buyer commitments, exception queue and Telegram notifications.

**Scale:** more districts, CHC/FPO onboarding, inter-district machine repositioning, buyer onboarding and audit exports.

## Do not build next

- more decorative 3D
- another AI chatbot
- generic dashboards
- fake live statistics
- payments without a real provider
- carbon-credit issuance
- maps without operational actions
- pitch/demo/judge surfaces

The product should be able to answer, with evidence:

**Which field needs service, which machine should go there, when should it go, where will the residue go, and can we prove what happened?**
