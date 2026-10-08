# NIRDHOOM Residue Operations Playbook

## Operating model

NIRDHOOM coordinates:

Field → harvest window → residue lot → machine → evidence → verified weight → transport → yard/buyer → delivery → downstream impact.

Residue is the primary operational object. Carbon/impact remains downstream.

## Control-tower rules

1. Prioritize fields with a clearance deadline inside 48 hours.
2. Prefer compatible idle/available machine capacity.
3. Treat machine matching as a proposal until an operator/dispatcher confirms it.
4. Do not call an estimated residue quantity a verified weight.
5. Do not commit a lot to a buyer before weighment and quality checks.
6. Keep buyer demand, buyer offer, acceptance and delivery as separate states.
7. Watch storage yards at 80% projected occupancy; redirect before capacity is exhausted.
8. Weather is a planning signal only.
9. GPS freshness is operational telemetry, not proof of field work.
10. Remote sensing is supporting evidence only; absence of a detection is not proof of no burning.
11. Cadastral/reference geometry and farmer/operator geometry must retain their provenance.
12. Offline evidence states must remain explicit: Saved locally → Waiting to sync → Uploading → Uploaded → Verified.

## Exception queue

The control tower currently classifies:

- PICKUP_OVERDUE
- MACHINE_SHORTFALL
- UNWEIGHED_LOT
- UNMATCHED_DEMAND
- YARD_CAPACITY
- STALE_GPS
- WEATHER_CAUTION

Each exception has severity, reason and next action. Resolution remains actor/workflow-owned.

## Capacity matching

The planning engine scores available machines using current status, assigned-field load and daily capacity. It is a recommendation engine, not an authoritative dispatch assignment.

For production dispatch, a future server-side route/capacity RPC should validate:

- machine availability
- machine capability source
- field access
- operator assignment
- time window
- route feasibility
- conflicting reservations

## Buyer coverage

Coverage should be shown as:

Required → Proposed/Committed → Verified → Delivered.

A proposed match is not a commercial transaction.

## Storage

For every yard track:

capacity → current load → incoming load → projected occupancy → status.

Use WATCH at 80% projected occupancy and FULL at or above capacity.

## Pilot

The recommended first pilot is one district / CHC cluster / real offtaker with 20–50 fields.

Measure:

- on-time pickup
- machine utilization
- verified tonnes
- residue stranded >24h
- demand coverage
- yard overflow avoided
- evidence completeness
- operator GPS freshness
- delivery reconciliation

Do not claim programme-wide impact from a pilot.

## Satellite source resilience

Do not hard-code one FIRMS sensor as the permanent source. Store sensor, product, observation time, confidence, geometry and source/version metadata. Treat the observation as supporting evidence.

## Product boundary

Do not add real payments, registry-grade carbon issuance, or unsupported buyer prices until a real provider/counterparty workflow exists.
