# NIRDHOOM — Field-First Network (V7)

A farmer-first crop-residue clearance and offtake product rebuilt from the supplied NIRDHOOM source material and earlier project requirements.

## What is in this build

### Farmer surface
- Home / next action
- My Fields
- Real OpenStreetMap basemap with source-derived field polygons where available
- Field-boundary drawing prototype
- Clearance booking
- Clearance timeline
- Machine/operator contact
- Weather advisory for the selected field
- Residue-market pathways
- Impact view
- NIRDHOOM Sathi context UI
- Passwordless Supabase sign-in foundation
- PWA shell / offline app-shell foundation

### Network surfaces
- Operator job flow: assigned → arrived → baling → proof → complete
- Dispatch: deadline queue + fleet view
- Verification: field/evidence/remote-sensing audit model
- Carbon: evidence-chain model without premature credit claims

### Backend model
- Profiles and roles
- Fields / geometry
- Machines
- Bookings
- Field events
- Machine GPS history
- Evidence assets
- Verification events
- Residue lots
- Buyers / buyer offers
- Payments
- Notifications
- Weather snapshots
- AI conversations
- Audit log
- RLS + least-privilege grants
- Role-escalation protection

## Run locally

Use Node.js 24.x.

```bash
npm install
npm run dev
```

For a static code check without installing the dependency tree:

```bash
npm run audit
npm run syntaxcheck
```

The repository contains a Vite app launched from `src/main.jsx`; `src/main.tsx` and `src/App.tsx` are a separate TypeScript app and are not the current browser entry point. The production build runs Vite, while `npm run syntaxcheck` checks the TypeScript project. Keep `package.json` and `package-lock.json` synchronized: run `npm install` after dependency changes and commit the resulting lockfile. A successful local build and CI run are required before deployment.

## AI

The Sathi UI calls `/api/assistant`. With `OPENAI_API_KEY` configured on the server, the function uses the OpenAI Responses API with `gpt-5.6-luna` by default; otherwise it falls back to a deterministic safe response. The API key is never sent to the browser. For production, set `REQUIRE_AUTH_FOR_AI=true` and configure Supabase URL/publishable key on the server so the function verifies the user session.

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/202609270001_nirdhoom_core.sql`.
3. Run `supabase/migrations/202609270002_nirdhoom_production.sql`.
4. Optionally run `supabase/seed.sql` for demo fleet/buyer records.
5. Copy `.env.example` to `.env.local`.
6. Add only `VITE_SUPABASE_URL` and the browser-safe publishable key.
7. Never expose a service-role or secret key in the browser.

The farmer role is the default. Dispatcher/verifier/operator/admin role assignment must be performed through an authorized backend/admin process; the profile trigger prevents a user from promoting their own role.

## Production integrations still required

- Phone OTP / WhatsApp onboarding and consent
- Verified cadastral/Khasra workflow and real field polygon source
- Live machine GPS device integration
- Dispatch optimizer / OR-Tools service
- Booking rules and real service-area capacity
- Payment provider + webhook reconciliation
- Supabase Storage evidence uploads
- Remote-sensing ingestion and audit pipeline
- Buyer contracts, offers and settlement
- Production AI provider with authenticated data access
- SMS / WhatsApp / push notifications
- True offline operator sync queue
- Automated unit, integration, RLS and end-to-end tests
- Monitoring, rate limiting, alerting and audit retention
- Privacy policy, terms, consent records and data-retention policy

## Data provenance

The demo field/machine/buyer records are derived from the supplied NIRDHOOM HTML source. They are intentionally labelled as demo/prototype data in the UI. Do not present them as live operational measurements until the underlying systems are connected and verified.

Project images in `public/images/` came from earlier NIRDHOOM project assets in the working materials. Verify source/licensing/permission before public launch.

## V5 additions
- Payment-trail surface with explicit non-settlement language
- Notification center and read-state persistence
- Role-aware operational surface navigation
- Operator offline job/proof queue using localStorage
- Online/offline status indicator
- Hardened field-event RLS: farmers cannot fabricate operational events from the browser
- Booking writes `fields.status = BOOKED` when connected

## Production sequence
1. Create a dedicated NIRDHOOM Supabase project (do not reuse unrelated projects).
2. Run both migrations in order.
3. Seed only approved demo/network data.
4. Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and server-side `OPENAI_API_KEY`.
5. Enable `REQUIRE_AUTH_FOR_AI=true` after auth is configured.
6. Add a real payment provider/webhook and real object storage before showing settlement.
7. Add verified cadastral/field geometry through an authorized integration.
8. Add operator GPS + evidence upload and server-side event creation.
9. Run `npm install`, `npm run syntaxcheck`, `npm run audit`, `npm run build` in CI.

## V6 — PDF-to-production pass

The attached **Parali: The Reframe** brief is now reflected directly in the codebase. See `PDF-FEATURE-MATRIX.md` for page-by-page coverage and `LINE-BY-LINE-AUDIT.md` for the executable-source audit.

### New production foundations
- Phone OTP + explicit farmer consent record.
- PostGIS field polygon alongside GeoJSON provenance.
- Dynamic per-acre quote with guarantee date, penalty basis and pricing band.
- Job state machine and operator field-event logging.
- Browser machine GPS capture with RLS-gated inserts.
- Supabase Storage evidence bucket + linked evidence records.
- FIRMS server adapter using a secret MAP_KEY.
- Dispatch API with a production OR-Tools service hook and safe fallback.
- Buyer contracts, storage yards, dispatch records and credits wallet schema.
- Harvest forecast and soil-report schema.
- Signed payment webhook foundation.
- WhatsApp Cloud API server adapter.
- Sathi can ground answers in the authenticated live field record.

### Production deployment sequence
1. Create a **dedicated NIRDHOOM Supabase project**; do not reuse another project.
2. Enable PostGIS in a dedicated extension schema, then run migrations `001`, `002`, `003` in order.
3. Configure phone authentication/SMS in Supabase and test the OTP flow.
4. Configure the `evidence` Storage bucket policies from migration `003`.
5. Connect a verified cadastral/Khasra source and mark `boundary_source=cadastral` only after verification.
6. Deploy the OR-Tools service and set `DISPATCH_SERVICE_URL`.
7. Request a NASA FIRMS MAP_KEY and set `FIRMS_MAP_KEY` server-side.
8. Connect a payout provider in sandbox first; route provider webhooks to the payment webhook endpoint and reconcile them in a privileged backend function.
9. Configure WhatsApp Cloud API credentials and a separate IVR provider before advertising voice support.
10. Add Sentinel-2/Bhuvan credentials and calibrate harvest forecasts against local agronomic observations.
11. Add monitoring, rate limits, retry queues, audit retention, privacy policy and consent/revocation handling.
12. Run `npm install && npm run syntaxcheck && npm run audit && npm run build` in CI before Vercel deploy.

## V7 — close the operational loop

V7 intentionally stops expanding visual dashboard scope. The primary transaction is now:

`Field → consent → quote → guaranteed booking → OR-Tools dispatch → job → GPS → evidence → QR residue lot → buyer offer → verification → payment ledger`

### V7 database sequence

Run these migrations in order:

1. `202609270001_nirdhoom_core.sql`
2. `202609270002_nirdhoom_production.sql`
3. `202609270003_nirdhoom_v6.sql`
4. `202609270004_nirdhoom_v7.sql`

### V7 environment additions

- `SUPABASE_SERVICE_ROLE_KEY` — server only, required for webhook reconciliation.
- `REQUIRE_AUTH_FOR_FIRMS=true` — recommended before enabling FIRMS in production.
- `PAYMENT_PROVIDER` / `PAYMENT_PROVIDER_API_URL` — provider adapter configuration.
- `PAYMENT_WEBHOOK_SECRET` — signed webhook verification.
- Existing FIRMS, dispatch, WhatsApp, IVR and AI variables remain server-side.

### V7 production checks

```bash
npm install
npm run syntaxcheck
npm run test
npm run audit
npm run build
npm run e2e
```

Do not enable live payout until the provider adapter and webhook reconciliation have been tested in sandbox. Do not label a self-drawn polygon as cadastral. Do not issue a carbon claim solely from a missing FIRMS detection.
