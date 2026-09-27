# NIRDHOOM V7 — Completion and Pilot Readiness Plan

This document is the consolidated implementation checklist for taking the current repository from a prototype to a controlled field pilot. It is deliberately explicit about the difference between code that exists, integrations that are placeholders, and operational work that requires real partners or credentials.

## Current repository facts

- The active Vite browser entry is `src/main.jsx`.
- `src/main.tsx` and `src/App.tsx` are a separate, currently inactive application path.
- The repository contains API routes for assistant, quote, dispatch, FIRMS, payment initiation/webhook, WhatsApp and IVR.
- The database contains sequential migrations 001–004; the later migrations add operational tables and transactional functions.
- The payment initiation route is intentionally a stub and returns 501 when a provider adapter would be needed. Do not describe payouts as live.
- The dispatch route has a local heuristic fallback. It is not equivalent to a validated OR-Tools optimizer.
- Demo field, machine and buyer records are not live operational data.
- The service worker is an app-shell/offline foundation, not proof of complete offline transaction synchronization.
- Static source checks do not replace database, provider, device or end-to-end integration tests.

## P0 — Required before a live pilot

### 1. Reproducible build and repository hygiene
- [ ] Regenerate and commit `package-lock.json` from the current `package.json`; use `npm ci` in CI after the lockfile is synchronized.
- [ ] Confirm Node.js version consistency across local development, CI and Vercel.
- [ ] Run syntax/type checks, static audit, unit tests, production build and browser tests on the final commit.
- [ ] Inspect and resolve all CI failures; retain run links in the release notes.
- [ ] Decide whether the inactive TSX app is to be removed, archived or migrated to; avoid maintaining two competing app implementations.
- [ ] Review large generated/archive files and decide whether they belong in Git or release artifacts.

### 2. Database and access control
- [ ] Apply migrations 001, 002, 003 and 004 in order to a fresh dedicated Supabase project.
- [ ] Repeat migration testing against a representative existing schema.
- [ ] Verify every foreign key, trigger, index, constraint and RPC executes as intended.
- [ ] Test row-level security using separate farmer, operator, dispatcher, verifier and admin accounts.
- [ ] Prove a farmer cannot read or modify another farmer's records.
- [ ] Prove operators can access only assigned jobs and permitted evidence.
- [ ] Prove operational state transitions and overrides require authorized roles.
- [ ] Test concurrent booking requests and concurrent buyer-offer acceptance.
- [ ] Document backup, restore, retention and incident recovery procedures.

### 3. Booking, quote and guarantee
- [ ] Validate request shape, field ownership, field status, acreage, date and service area server-side.
- [ ] Calculate amounts on the server; never trust a client-supplied payout or total.
- [ ] Reserve a slot transactionally against real machine capacity.
- [ ] Do not return a guaranteed date until the capacity reservation succeeds.
- [ ] Prevent duplicate active bookings and handle concurrent requests idempotently.
- [ ] Define the guarantee, exclusions, cancellation rules, penalties and dispute process with the pilot operator.
- [ ] Show quote components and clearly label indicative estimates versus confirmed offers.

### 4. Dispatch and machinery
- [ ] Validate all incoming coordinates, machine status, capacity, field acreage and deadlines.
- [ ] Never silently over-assign capacity; return unassigned work and a reason.
- [ ] Add route/assignment explanations and a manual reassignment audit trail.
- [ ] Integrate and test the selected dispatch optimizer; label heuristic fallback accurately.
- [ ] Define machine availability, maintenance, breakdown and operator shift rules.
- [ ] Verify GPS source, freshness and accuracy before displaying a machine as live.

### 5. Evidence and verification
- [ ] Enforce booking/field ownership and evidence upload limits server-side.
- [ ] Validate MIME type and actual file content; keep evidence objects private.
- [ ] Verify SHA-256 on trusted server-side bytes, not only a browser-provided digest.
- [ ] Record capture time, upload time, GPS accuracy, actor and sync source separately.
- [ ] Keep field geometry, operator evidence, satellite detections and human review as distinct evidence sources.
- [ ] Record verifier identity, decision, reason and any override in an auditable history.
- [ ] Handle absent, delayed, malformed or contradictory satellite data.
- [ ] Never treat absence of a FIRMS detection as proof that no burning occurred.
- [ ] Provide a human review and appeal path for disputed verification.

### 6. Payment
- [ ] Select and onboard the actual payout provider and confirm its supported payout contract.
- [ ] Implement provider-specific initiation, authentication, amount validation and provider reference storage.
- [ ] Implement provider-specific webhook signature verification over the exact raw request bytes.
- [ ] Validate event types, account/merchant identity, amount, currency and payment reference.
- [ ] Make webhook handling idempotent and protect against replay and out-of-order events.
- [ ] Update payment state only from trusted provider events or an authenticated reconciliation process.
- [ ] Add reconciliation for missing, failed, reversed and delayed payouts.
- [ ] Show estimated, initiated, processing, paid and failed states distinctly.
- [ ] Do not claim live UPI settlement until test and live provider flows have been verified.

### 7. API security and reliability
- [ ] Add request-size limits, rate limits and safe error responses to public endpoints.
- [ ] Validate all inputs with shared schemas and reject unexpected values.
- [ ] Apply authorization consistently to every endpoint that reads or changes private data.
- [ ] Add timeouts and bounded retries to external service calls.
- [ ] Avoid returning raw provider errors, secrets or sensitive upstream payloads.
- [ ] Add request IDs and structured logs without logging tokens, phone numbers or sensitive evidence.
- [ ] Add health checks and alerting for failed integrations.

## P1 — Required for a usable pilot

### Farmer application
- [ ] Test on low-end Android devices and slow/unstable mobile networks.
- [ ] Make field registration, booking and status tracking the primary navigation path.
- [ ] Distinguish farmer-declared acreage from geometry-calculated acreage and verified cadastral acreage.
- [ ] Provide loading, empty, error, retry and offline states for every data-backed screen.
- [ ] Provide booking cancellation/date-change rules and a support/escalation route.
- [ ] Provide payment history, transaction references when available and a dispute path.
- [ ] Review Punjabi/Hindi wording with native speakers and test readability in the field.
- [ ] Make live, stale, cached, demo and indicative data visibly distinguishable.

### Operator PWA
- [ ] Test assigned → arrived → baling → evidence → complete on a real Android device.
- [ ] Test denied GPS permission, poor accuracy, backgrounding, refresh and device restart.
- [ ] Persist queued actions safely and show pending/syncing/synced/failed states.
- [ ] Make retries safe and prevent duplicate job completion.
- [ ] Provide an operator-reported breakdown/delay path.
- [ ] Test offline evidence capture and later upload with real file sizes.

### Dispatch console
- [ ] Separate unassigned, assigned, delayed and completed jobs.
- [ ] Show machine availability, capacity and last GPS update.
- [ ] Make manual assignment/reassignment auditable.
- [ ] Explain why jobs remain unassigned.
- [ ] Test overloaded, invalid and incomplete routing input.

### PWA and accessibility
- [ ] Verify all manifest icons exist and render at declared sizes.
- [ ] Keep one canonical manifest and remove conflicting/obsolete manifest references.
- [ ] Version and test service-worker cache updates and recovery.
- [ ] Do not cache authenticated API responses or sensitive farmer data indiscriminately.
- [ ] Test install, update, offline launch and reconnection.
- [ ] Add keyboard focus, semantic labels, contrast checks and reduced-motion behavior.
- [ ] Compress imagery and add useful alt text.

## P2 — Add only after the core loop is proven

- [ ] Buyer contracts with quantity, price, quality/moisture, delivery and settlement terms.
- [ ] Residue lot inventory with weight, location, quality, custody and dispatch history.
- [ ] Buyer offer acceptance and settlement reconciliation.
- [ ] Harvest forecast with source, date, confidence/limitations and fallback behavior.
- [ ] Soil report provenance, test date and reviewed action plan.
- [ ] Credit wallet only when balances are backed by auditable transactions.
- [ ] Carbon accounting only after a documented methodology, evidence chain and independent review.
- [ ] Analytics that distinguish operational metrics from demo and public research data.
- [ ] AI Sathi only with authenticated, field-scoped access, bounded answers and safe fallback.
- [ ] Notification delivery receipts, retries, consent and preferences.

## Required automated tests

### Unit tests
- [ ] Geometry validation: coordinate ranges, ring shape, duplicate points, self-intersections and invalid polygons.
- [ ] Quote calculation: invalid/edge dates, acreage bounds and pricing boundaries.
- [ ] Dispatch: capacity, unavailable machines, no eligible machine and deadline ordering.
- [ ] Payment: signature validation, event mapping, duplicate events and out-of-order events.
- [ ] Evidence: hash calculation, content validation and metadata completeness.
- [ ] Offline queue: persistence, retry, deduplication and conflict handling.

### Integration tests
- [ ] Booking RPC against a disposable test database.
- [ ] RLS tests for every role and cross-tenant access attempts.
- [ ] State-transition permissions and invalid transition rejection.
- [ ] Evidence upload and database linkage.
- [ ] Concurrent booking and offer acceptance.
- [ ] Payment sandbox initiation, webhook and reconciliation.
- [ ] FIRMS timeout, malformed response, empty response and polygon matching.

### End-to-end tests
- [ ] Farmer registers a field and submits a booking.
- [ ] Dispatcher assigns a machine.
- [ ] Operator arrives, records work and uploads evidence.
- [ ] Verifier reviews evidence and records a decision.
- [ ] Payment progresses through a provider sandbox.
- [ ] Unauthorized users are blocked from restricted actions.
- [ ] Mobile navigation and offline recovery work.

## Pilot operations and governance
- [ ] Select a pilot block and confirm participating farmers, machinery owners, operators and buyers.
- [ ] Agree on service levels, pricing, penalties, cancellations and dispute handling in writing.
- [ ] Confirm actual residue offtake capacity and quality requirements before accepting volume.
- [ ] Obtain informed consent and publish privacy, terms, retention and grievance information.
- [ ] Establish support ownership, escalation contacts, operator training and field procedures.
- [ ] Define pilot success metrics and baseline; do not report demo records as outcomes.
- [ ] Establish a release checklist, rollback process and incident response owner.

## Exit criteria

A pilot should not be called production-ready until:
1. A clean install, build and all required CI checks pass on the release commit.
2. Migrations run successfully on a dedicated project.
3. RLS and authorization tests pass for all roles.
4. One complete booking-to-payment sandbox journey passes end to end.
5. Offline operator recovery is tested on a real device.
6. Provider, machine and buyer capacity are confirmed by the responsible partners.
7. Privacy, consent, support, monitoring and rollback procedures are in place.

## Known blockers that cannot be completed from repository code alone

Live payments, real machine GPS, verified cadastral data, real buyer contracts, production messaging, field-device testing and pilot guarantees require provider credentials, partner agreements, actual devices/data and operational decisions. Keep these clearly marked as unconfigured until verified. Never replace missing integration evidence with simulated success.
