# NIRDHOOM V6 line-level audit

Date: 2026-09-27

## What was audited

The V5 executable source was inspected at line level, then the V6 source was re-parsed after changes. The audit covers:

- `src/main.jsx`
- `src/styles.css`
- all Vercel API functions
- Supabase core/production/V6 migrations
- seed and configuration files

The executable JS/TS files were parsed with TypeScript's parser. The project audit also checks imported Lucide symbols, JSX component definitions, button handlers, security-sensitive strings, required integrations and schema presence.

## V5 issues found and corrected

1. **Runtime component error:** `PhotoBand` was rendered from `Home` but was not defined. V6 defines it and uses the supplied NIRDHOOM project images.
2. **Runtime icon error:** `Upload` was rendered in the operator flow but was not imported from `lucide-react`. V6 imports it.
3. **Auth mismatch:** V5 used email magic-link authentication. The brief explicitly says phone OTP with no passwords. V6 uses Supabase phone OTP + OTP verification and a separate consent record.
4. **Boundary data was not geospatial:** V5's drawing mode stored screen-space `x/y` points. V6 converts map taps to latitude/longitude and stores GeoJSON plus a PostGIS geography polygon on the backend.
5. **Booking was a fixed demo rate:** V5 hard-coded ₹1,500/acre. The current release calls `/api/quote` for a bounded planning estimate and keeps the booking path server-authoritative.
6. **Guarantees are not active in this release:** booking data retains legacy compatibility fields, but the farmer UI and quote path do not promise a guaranteed date or penalty payout.
7. **Dispatch was a toast:** V5's dispatch button did not solve anything. V6 calls `/api/dispatch`, supports a production `DISPATCH_SERVICE_URL`, and includes a deterministic fallback. A separate OR-Tools service can be connected without changing the farmer UI.
8. **GPS was only a label:** V5 displayed GPS-ready text. V6 uses `navigator.geolocation.watchPosition()` and writes authenticated operator pings to `machine_locations`.
9. **Proof was only localStorage:** V6 adds Supabase Storage evidence upload, linked `evidence_assets` records, offline queue fallback and role-aware RLS.
10. **FIRMS was not connected:** V6 adds a server-side FIRMS area API adapter using a secret `FIRMS_MAP_KEY`, with VIIRS NOAA-21 NRT as the default source.
11. **Sathi was not live-record aware:** V6's server endpoint can read the authenticated user's field through Supabase REST before answering, while still using a safe fallback when the provider is unavailable.
12. **Payment screen could not reconcile a real ledger:** V6 reads the `payments` table and adds a signed webhook receiver. It still refuses to claim settlement without a provider event.
13. **Buyer pathway stopped at cards:** V6 adds buyer contracts, dispatches, storage yards and open-offer data models.
14. **Credits wallet was missing:** V6 adds `credit_wallets` and `credit_transactions` and surfaces the retention-loop concept.
15. **Harvest intelligence was missing:** V6 adds a forecast model and a farmer-facing harvest intelligence surface designed for variety + weather + Sentinel-2 maturity inputs.
16. **Soil model was missing:** V6 adds a soil-report model and keeps the interface-layer concept from the brief; it does not pretend a cheap sensor is a lab.
17. **Evidence RLS was too broad:** V6 replaces the generic evidence insert policy with a linked field/booking/job check for operators and explicit verifier/admin access.
18. **Offline listeners were conditional:** V5 only installed online/offline listeners when Supabase existed. V6 installs them unconditionally so demo mode also reflects network state.
19. **Static audit was too weak:** V5's `syntaxcheck` intentionally used `--noResolve`, so it could parse source without detecting missing runtime symbols. V6 adds an explicit JSX/import scan and a TypeScript parser pass.

## Deliberately not faked

- No fake UPI reference.
- No fake paid state.
- No fake FIRMS non-burn certificate.
- No fake buyer bid.
- No fake carbon credit.
- No claim that a self-drawn boundary is cadastral truth.
- No claim that the browser GPS is an industrial machine telematics feed.

## Verification performed

- `npm run syntaxcheck` — PASS.
- `npm run audit` — PASS: 17 required files, 26 feature/security checks, JSX/import scan clean, button-handler scan clean.
- TypeScript parser over all executable JS/TS files — PASS.
- ZIP integrity test — run after packaging.
- Full `npm install` / Vite production build — not verified in this environment because `npm install` timed out again. This remains a CI/local verification step, not something to falsely mark as passed.

# V7 line-level audit

Date: 2026-09-27

## V7 changes inspected

1. `src/main.jsx`: booking now calls the transactional `reserve_clearance_booking` RPC instead of directly inserting a booking row.
2. `src/main.jsx`: operator state is keyed by authenticated user + field rather than one global localStorage job.
3. `src/main.jsx`: operator proof path uses the actual field UUID instead of a hard-coded FIELD-101 path.
4. `src/main.jsx`: proof records include SHA-256, GPS coordinates, GPS accuracy, timestamp, booking linkage and storage provenance.
5. `src/main.jsx`: operator arrival has a GPS proximity gate; database transition rules independently enforce the legal state sequence.
6. `src/main.jsx`: dispatch reads live booking rows and creates/upserts jobs after the solver returns a route.
7. `src/main.jsx`: buyer offer acceptance uses an atomic database RPC so one lot cannot be accepted twice.
8. `src/main.jsx`: verification loads evidence/lots, stores FIRMS observations and records a verifier decision through a controlled RPC.
9. `src/main.jsx`: payment-related demo surfaces are explicitly non-money-moving; live payment integration is outside this release.
10. `api/dispatch.ts`: dispatcher/admin authentication is required before route planning.
11. `api/firms.ts`: authentication can be enforced with `REQUIRE_AUTH_FOR_FIRMS=true`.
12. Payment API routes were subsequently removed from the release; no browser route can move money. Legacy migration fields remain only for schema compatibility.
13. `docs/NON-PAYMENT-RELEASE-SCOPE.md` is now the source of truth for the intentionally deferred payment boundary.
14. `supabase/migrations/202609270004_nirdhoom_v7.sql`: booking reservation, job transition, verification review, offer acceptance and cancellation are controlled server-side transactions.
15. `supabase/migrations/202609270004_nirdhoom_v7.sql`: direct farmer booking mutation was removed; dispatcher job/assignment and operator residue-lot write policies were added.
16. `supabase/migrations/202609270004_nirdhoom_v7.sql`: evidence hashes, field geometry area, lot custody and payment idempotency metadata were added.

## V7 verification

- TypeScript parser over frontend + API files: PASS.
- Node test suite: 3/3 PASS.
- Python dispatch service syntax: PASS.
- Node syntax checks for tests/E2E: PASS.
- V7 static audit: PASS — 22 required files, 32 feature/security checks, JSX/import scan clean, button-handler scan clean.
- Vite production build: not executed because dependencies are not installed in this runtime; CI/local build remains required.
- SQL execution: not executed because a PostgreSQL client/server is not available in this runtime; run migrations against the dedicated NIRDHOOM Supabase project before production.
