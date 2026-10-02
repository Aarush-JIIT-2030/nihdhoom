# NIRDHOOM production hardening audit

## Scope

Reviewed every source/config/data/migration file in the build directory, then ran a static structural audit and TypeScript/JSX syntax check.

Files reviewed: 15+ application/config/data files; source package is 780+ lines excluding image binaries.

## Checks executed

- Required-file existence and non-empty checks
- Root React mount check
- Browser secret-key scan
- Node/Vercel runtime alignment
- Supabase RLS presence
- Role-escalation protection presence
- Network route presence
- Weather integration presence
- Real map tile integration + attribution
- Field geometry/drawing support
- Payment/evidence/machine-GPS schema presence
- PWA shell presence
- Responsive CSS presence
- Idempotent demo seed check
- Button-handler scan
- TypeScript compiler syntax parse for `src/main.jsx` and `api/assistant.ts`

Result:

`npm run audit` → PASS

`npm run syntaxcheck` → PASS

## Bugs found and corrected from V3

1. Booking created a record but did not advance the selected field status. Fixed: booking now moves the local record to `BOOKED` and updates the displayed payout estimate.
2. Track timeline indexed the full status enum while the UI timeline starts at `BOOKED`. Fixed with workflow offset logic.
3. Booking date state could remain tied to the previous field when changing selection. Fixed by keying the booking surface to the selected field.
4. V3 profile update policy allowed a signed-in user to modify their own role. Fixed with a database trigger that blocks self role escalation.
5. V3 Vercel config pinned Node 20 while the project engine targeted a newer Node version. Fixed to Node 24.x.
6. Several Network modal destinations were only labels. Fixed so Operator/Dispatch/Verification/Marketplace/Carbon navigate to actual surfaces.
7. V3 field map was a decorative shape. Fixed with OpenStreetMap tiles and source-derived field polygons where available.
8. V3 did not expose a real field-boundary capture interaction. Added a boundary-drawing prototype.
9. V3 did not include machine GPS history schema. Added `machine_locations`.
10. V3 did not include a payment ledger schema. Added `payments`.
11. V3 did not include a structured evidence asset store. Added `evidence_assets`.
12. V3 did not include buyer offer records. Added `buyer_offers`.
13. V3 did not include weather snapshots/audit logs. Added both.
14. Demo seed buyer inserts were not idempotent. Fixed with `where not exists`.
15. Source-derived field records were reconciled with the uploaded source where the earlier V3 data had drifted; FIELD-103/104/105 now use the source-supported values.
16. Removed the unused Leaflet stylesheet because the current map implementation does not depend on Leaflet.
17. Added a PWA app shell for the operator/offline-first direction.

## Verification limitation

A production Vite build could not be run in the preparation environment because `npm install` repeatedly timed out. The code therefore has a passing compiler syntax check and static audit, but the final dependency-resolved `npm run build` must still be run locally/CI after installing dependencies.

## Important production cautions

- Demo pricing is not a contractual quote.
- Demo payout records are not live payments.
- FIRMS/VIIRS observations are supporting remote-sensing evidence, not absolute proof of field-level burning/non-burning.
- Demo buyer prices are not live offers.
- Carbon records are evidence-chain placeholders, not issued credits.
- Project images require source/licensing verification before public launch.

## V5 audit pass
- `npm run syntaxcheck` passes with the installed global TypeScript 5.x compiler.
- `npm run audit` passes 23 structural checks and the button-handler scan.
- Booking now persists the field status as `BOOKED` when Supabase is connected.
- Farmer-side creation of operational `field_events` was removed; operational roles must create those events.
- Added notification center/read state and payment-trail surface.
- Added online/offline indicator and local operator job/proof queue.
- Added role-aware network navigation in the client; production authorization remains enforced by RLS.
- Removed duplicate Sathi request headers.
- A full Vite production build could not be completed in this environment because dependency installation timed out. Run `npm install` then `npm run build` locally/CI.

## V6 audit pass
- Fixed two V5 runtime errors: missing `PhotoBand` component and missing `Upload` icon import.
- Replaced email-only prototype authentication with phone OTP + consent storage.
- Replaced screen-space boundary drawing with lat/lng polygon capture and PostGIS storage.
- Added dynamic quote, guarantee date, penalty basis and quote metadata.
- Added job events, operator GPS, evidence Storage upload and linked evidence RLS.
- Added dispatch API + OR-Tools service package + deterministic fallback.
- Added FIRMS API adapter with polygon matching; it remains supporting evidence rather than absolute non-burn proof.
- Added buyer contracts, storage yards, QR residue lots, credits wallet, harvest forecasts and soil reports.
- Added payment webhook foundation, WhatsApp Cloud API adapter and IVR provider adapter.
- Added live-record Sathi grounding, Node tests and GitHub Actions CI.
- `npm test` passes 3/3.
- `npm run syntaxcheck` passes.
- `npm run audit` passes 27 feature/security checks.
- TypeScript parser passes all 8 JS/TS source files.
- The current release intentionally has no browser E2E harness; CI covers type, audit, unit, build and dispatch-service checks.
