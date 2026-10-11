# Reference-project audit for NIRDHOOM

**Audit date:** 2026-10-11  
**Target:** `kaustubhdua/nihdhoom`  
**Purpose:** identify reusable patterns from the five supplied project archives without importing incompatible stacks, credentials, schemas, or visual effects blindly.

## Evidence and scope

The archives were supplied in chat, but the archive contents were not available to the active source-inspection workspace. To keep the review evidence-based, this pass inspected accessible public GitHub source repositories that match four of the archive names:

- `OSDHack-25-main.zip` → [osdc/OSDHack-25](https://github.com/osdc/OSDHack-25)
- `Innovationjiit.in-main.zip` → [Omtripathi007/Innovationjiit.in](https://github.com/Omtripathi007/Innovationjiit.in)
- `cicr-inventory-main.zip` → [DJByteForge/cicr-inventory](https://github.com/DJByteForge/cicr-inventory)
- `CICRCombined-main.zip` → [amancodes8/CICRCombined](https://github.com/amancodes8/CICRCombined)
- `Agentic-AI-website-main.zip` → exact public source repository not confidently identified; no features are attributed to this archive.

The public repository default branches may differ from the exact ZIP snapshots. This is a reference-source review, not a byte-for-byte archive audit or a claim that any reference project has been security-certified.

## NIRDHOOM baseline observed

The current NIRDHOOM tree already contains:
- React 19 + Vite + TypeScript and a Supabase client.
- A shared field-first UI kit and saffron-oriented design tokens.
- Leaflet operations map, field detail drawer and dispatch panel.
- Farmer onboarding, clearance booking, operator PWA and offline evidence queue.
- Residue lots, pooling, offtake/forecast, evidence review and field provenance components.
- Motion, Three.js and reusable React Bits-style components.
- Source-level tests and a release-check script.

**Implication:** a wholesale rewrite or adding another UI/animation framework is not justified. The biggest gains come from connecting existing surfaces, validating real flows, and making operational queues easier to use.

## Reference findings and safe adaptations

### 1. OSDHack'25 — visual identity and component presentation

Source: [osdc/OSDHack-25](https://github.com/osdc/OSDHack-25), MIT license visible in the repository.

**Potential value**
- Strong visual identity and clear campaign/landing-page hierarchy.
- Reusable frontend styling and visual assets as inspiration.
- A reminder that the landing page should quickly communicate the problem, product and primary action.

**NIRDHOOM adaptation**
- Keep the saffron/earth/green design tokens already in the product.
- Improve spacing, typographic hierarchy, imagery and empty/loading states rather than importing a second theme.
- Use animation only to explain a state transition or draw attention to a next action.

**Do not copy**
- Event-specific branding, pixel fonts, decorative effects, or assets without checking individual asset licensing.
- Any code that adds weight without helping a farmer, operator or dispatcher complete a task.

### 2. Innovationjiit.in — accessibility and progressive enhancement

Source: [Omtripathi007/Innovationjiit.in](https://github.com/Omtripathi007/Innovationjiit.in). Its README describes vanilla HTML/CSS/JS, mobile-first responsive layouts, semantic HTML, CSS variables, keyboard focus, reduced-motion support, and Intersection Observer-based effects. The README's WCAG AA claim is a project claim, not an independent audit result.

**Potential value**
- Simple, responsive patterns with fewer runtime dependencies.
- Strong focus states, accessible mobile navigation, semantic landmarks, and reduced-motion support.
- Progressive enhancement rather than making the whole page depend on animation.

**NIRDHOOM adaptation**
- Preserve/extend the existing visible focus rings and reduced-motion rules.
- Test every form, modal, drawer and map control using keyboard and screen reader semantics.
- Check at 360×800 and 390×844, including text zoom and Hindi labels.
- Avoid making status depend on colour alone; pair status colour with text/icon.

**Do not copy**
- The purple/pink club palette or static-site component injection pattern into React.
- Treat the repository's accessibility claims as proof; run automated and manual tests against NIRDHOOM.

### 3. CICR Inventory — resource availability, queues and concurrency

Source: [DJByteForge/cicr-inventory](https://github.com/DJByteForge/cicr-inventory). Its README documents inventory/borrowing, role-based access, notifications, queueing and database-level availability guards. The README points to a related inventory repository for the live demo; the exact supplied ZIP still needs hash-level comparison.

**Potential value**
- Explicit availability state, approval queues, return/maintenance handling, notifications, and atomic protection against double allocation.
- Operational status should be visible and enforced at the database/API layer, not just hidden in the UI.

**NIRDHOOM adaptation**
- Model machinery as available, assigned, en route, working, maintenance, and unavailable, with only valid transitions.
- Show dispatch queue age, deadline, village/distance, required implement and machine capability.
- Enforce overlapping-job and capacity constraints server-side/transactionally.
- Make retries idempotent and record reassignment/failure reasons in an audit trail.
- Give each role a narrow queue: operator's assigned jobs, dispatcher exceptions, verifier pending reviews.

**Do not copy**
- The separate Express/Redis/Postgres deployment stack just because the reference uses it.
- Its institutional identity policy or superadmin arrangement; NIRDHOOM's identity source remains Supabase Auth.
- Local-storage fallbacks as an authoritative copy of inventory or dispatch data.

### 4. CICRCombined — modular role workspaces and operational communication

Source: [amancodes8/CICRCombined](https://github.com/amancodes8/CICRCombined). Its README describes React/Vite/Tailwind/Framer Motion frontend, Express/MongoDB backend, role-based workflows, notifications, issue tracking and optional AI summaries/chatbot. README states ISC license.

**Potential value**
- A coherent navigation model across many modules.
- Role-specific dashboards, actionable notifications, issue queues and audit-friendly operations.
- Optional AI summaries as a convenience rather than the source of truth.

**NIRDHOOM adaptation**
- Keep farmer, operator, verifier, dispatcher and buyer tasks separate while sharing common status/timeline components.
- Notifications should deep-link to a specific actionable record and be deduplicated.
- Surface operational exceptions (missing evidence, delayed dispatch, failed upload, buyer pickup overdue) rather than another generic KPI grid.
- Any AI summary must be grounded in authorized live records, show the relevant record links, and never approve verification/settlement by itself.

**Do not copy**
- The MongoDB/JWT backend or introduce a second identity provider; this would duplicate NIRDHOOM's current Supabase model.
- Encrypting arbitrary application data without a data classification/key lifecycle plan, or copying hard-coded institutional account policies.

### 5. Agentic-AI-website — not yet attributable

The exact source repository could not be confidently matched from the archive name. No specific component, library, feature or license is attributed to this project in this report.

**Potential evaluation once the exact source is available**
- Identify the actual framework and dependencies.
- Check license and asset provenance.
- Separate presentation/animation code from business logic.
- Evaluate any agent/tool permissions and prevent it from mutating bookings, verification, offers or dispatch without explicit authorization.
- Measure bundle size and runtime cost before adoption.

## Prioritized changes for NIRDHOOM

| Priority | Change | Reason | Acceptance check |
|---|---|---|---|
| P0 | Real authenticated E2E for OTP, consent, field registration, booking/cancellation, Telegram, evidence, verification and dispatch | A polished UI is not production-ready if core actions fail | Staging run with role-specific accounts and recorded pass/fail evidence |
| P0 | Review null-auth and null-role guards on every callable SECURITY DEFINER function | Prevents role/ownership bypasses | Tests cover anonymous, authenticated-without-profile, wrong role, correct role, and cross-owner access |
| P0 | Reconcile migration ledger against clean-install schema | Prevents fresh installs and production from diverging | Reviewed schema diff and exact migration mapping; no blind production push |
| P1 | Dispatch exception queue with machine capability and assignment conflict validation | Directly improves field operations | Duplicate/overlapping assignments rejected server-side; exceptions have owners and timestamps |
| P1 | Shared lifecycle timeline from field → booking → job → evidence → verified lot → pickup | Reduces fragmented screens and confusion | One record timeline shows authoritative state, next action and actor |
| P1 | Mobile and keyboard accessibility sweep | Farmer/operator workflows are phone-first | 360×800 and 390×844 manual pass, keyboard pass, reduced-motion and contrast checks |
| P1 | Operational alerts for stale/failed work | Makes failure actionable | Alerts are deduplicated, role-scoped and link to the affected record |
| P2 | Buyer lot allocation and transport only after staged authorization matrix | Prevents double selling or unauthorized state changes | Concurrent allocation tests and cross-role negative tests pass |
| P2 | Grounded dispatch assistant | Could reduce dispatcher workload | Recommendations cite real records and require human confirmation; no autonomous mutations |

## Explicitly avoid for now

- Adding another animation/UI framework.
- Rewriting the Supabase-backed application to Express/MongoDB or another auth provider.
- Copying reference database schemas or broad public RLS policies.
- Using sample/historical buyer data as current demand.
- Claiming satellite observations prove no burning occurred.
- Enabling payment, carbon issuance or marketplace transport state transitions before operational evidence and authorization tests pass.
- Treating a README, source-level test, or successful HTTP 200 as proof of end-to-end readiness.

## Next implementation sequence

1. Run the existing `npm run release:check` in a clean checkout and fix any reproducible source/test failures.
2. Complete isolated staging setup and authenticated E2E.
3. Add transactional dispatch conflict checks and focused tests if any gaps remain.
4. Run manual desktop/mobile/keyboard checks on the exact deployed commit.
5. Adopt only the reference patterns that address measured problems; record bundle-size and regression results for any dependency addition.

## Audit limitations

- The exact contents of all five ZIP archives were not available for direct extraction in this source-review environment.
- The Agentic-AI archive is not matched to a verified public repository.
- No claim is made that any reference source is free of vulnerabilities.
- This document does not claim that production browser E2E, staging authorization tests, or a deployment has passed.
