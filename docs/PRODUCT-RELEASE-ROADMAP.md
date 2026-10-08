# NIRDHOOM — Product Release Roadmap

Updated: 2026-10-08

## What the latest field evidence changes

Recent ICAR/ATARI work in Punjab is moving the problem framing from “provide machines” toward **demand-driven, location-specific coordination**: district-wise matching of machine capacity to actual demand, better CHC coordination, baler tracking, biomass aggregation, assured offtake, and stronger convergence among farmers, CHCs, KVKs, service providers and industry.

ICAR's September 2026 Punjab stakeholder workshop also proposed **CRM CONNECT** as a common coordination layer for shared calendars, technology deployment, data sharing and field-level issue resolution. NIRDHOOM should therefore compete on operational coordination and traceability, not on another generic agriculture dashboard.

## Priority 1 — Make the clearance workflow excellent

**Goal:** a farmer can complete a field request in under two minutes, with the next action always obvious.

- Reduce farmer onboarding to field → consent → requested date → service request.
- Show capacity as a real availability state, not a decorative metric.
- Return a clear reason when no machine can be assigned.
- Keep quote, booking, dispatch and completion as separate states.
- Make offline/sync status persistent and understandable.
- Test the complete flow on low-end Android widths and slow connections.

**Release gate:** a supervised pilot user can complete the flow without operator assistance.

## Priority 2 — Build the demand-driven control tower

**Goal:** dispatchers see where residue demand, machine capacity and field deadlines collide.

Add operational views for:
- fields approaching clearance deadlines;
- available machine capacity by geography and day;
- unassigned jobs with explicit reason codes;
- residue lots ready for pickup;
- buyer demand windows;
- storage-yard capacity and incoming tonnes;
- exceptions that need human action.

Do not automatically convert a solver proposal into a confirmed dispatch. The dispatcher remains the decision point.

## Priority 3 — Make residue the transaction-independent operational object

Every verified lot should carry:
- source field;
- residue type;
- measured quantity;
- moisture/quality;
- verification source;
- readiness date;
- pickup deadline;
- machine/job lineage;
- custody events;
- buyer/destination state.

The product should be able to answer: **Where did this tonne come from, who handled it, what evidence supports it, and where is it going?**

## Priority 4 — Turn Telegram into the farmer companion

Telegram Mini Apps can provide a first-class authenticated experience inside Telegram. The next release should use deep links for specific tasks:
- Book clearance;
- Track my operation;
- Upload/associate evidence;
- My fields;
- Residue status.

Keep sensitive state server-authoritative. Validate Telegram initData on the server, expire link tokens, scope every action to the linked profile, and never treat a Telegram photo alone as verification.

## Priority 5 — Measure outcomes that matter

Avoid vanity KPIs. Track:
- request-to-assignment time;
- percentage of requests assigned before deadline;
- machine utilization;
- kilometres per completed field;
- verified tonnes per field;
- tonnes waiting for pickup;
- buyer-demand coverage;
- evidence completeness;
- offline evidence replay success;
- exception resolution time.

Do not claim environmental impact until the underlying operational records support it.

## Priority 6 — Pilot before adding more AI

AI should remain a bounded assistant for explaining authenticated operational state. It should not decide dispatch, verify fields, invent ETAs, or create commercial commitments.

The next AI investment should be:
1. explain why a job is unassigned;
2. summarize exceptions;
3. translate operational messages into Punjabi/Hindi/English;
4. answer questions from authenticated field context;
5. suggest—not execute—next actions.

## Priority 7 — Production hardening

Before calling the system production-ready in a real field deployment:
- move rate limiting from per-instance memory to a shared/distributed store or platform control;
- add environment-backed observability and request IDs without logging farmer PII;
- seed a dedicated staging database and execute the RLS role matrix against it;
- test Telegram webhook retries and duplicate updates;
- test Mini App auth with signed fixtures and expired timestamps;
- run end-to-end browser checks on desktop and Android-sized viewports;
- test image failure/fallback behavior;
- verify every production image license and attribution;
- monitor third-party provider latency and failure rates;
- keep payment and carbon issuance disabled until their provider, ledger, reconciliation and audit controls are real.

## Product thesis

NIRDHOOM should be the **field-to-biomass coordination layer** for crop-residue operations:

**Field request → capacity match → dispatch → operator proof → verified residue → pickup → buyer demand**

That is narrower, more defensible and more useful than trying to be a general AI agriculture platform.