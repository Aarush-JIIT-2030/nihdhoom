# NIRDHOOM connected Supabase

The dedicated NIRDHOOM Supabase project is connected to the application. This document describes the current repository migration chain and release boundaries.

## Project

- Region: ap-south-1
- Browser configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Server code must use server-side Supabase credentials only where required.
- Never commit service-role, provider, AI or webhook secrets.
- Payments remain deliberately non-live for the current release scope.

## Current repository migration chain

The repository currently contains 18 ordered migrations:

1. 202609270001_nirdhoom_core
2. 202609270002_nirdhoom_production
3. 202609270003_nirdhoom_v6
4. 202609270004_nirdhoom_v7
5. 202610010001_field_geometry_verification
6. 202610010002_verified_area_booking
7. 202610010005_nirdhoom_booking_integrity
8. 202610010006_nirdhoom_verification_and_settlement_integrity
9. 202610010007_nirdhoom_operational_integrity
10. 20261001_nirdhoom_database_hygiene
11. 20261001_nirdhoom_rls_initplan_fix
12. 202610020008_nirdhoom_client_write_integrity
13. 202610020009_nirdhoom_security_advisor_cleanup
14. 202610020010_nirdhoom_residue_pooling_and_research
15. 202610020011_nirdhoom_residue_pooling_security_and_indexes
16. 202610020012_nirdhoom_residue_pool_verification_gate
17. 202610040001_machine_privacy_and_pool_member_visibility
18. 202610040002_revoke_trigger_function_execute

See `docs/DATABASE-RELEASE-LEDGER.md` for the release checklist and migration rules.

## Current integrity boundaries

- RLS and role-escalation protections are part of the production schema.
- Booking creation is server-authoritative; arbitrary client booking writes are revoked.
- Field ownership/tampering is protected by database triggers/policies.
- Evidence storage is private and linked to authorized operational jobs.
- Verification requires operational evidence before residue can pass the verification gate.
- Residue pooling is restricted to verified residue.
- Trigger-only functions have direct execution revoked.
- Payment initiation/webhooks intentionally fail closed with no money movement.

## Application modes

Production/live mode loads operational records from Supabase and starts without seeded demo records.

Demo mode is explicit via `VITE_NIRDHOOM_DEMO_MODE=true` and persists demo state locally. Demo UI must remain visibly labelled as simulated and must not be interpreted as an external registry, settlement or payment record.

## External gates still required for a genuinely live field pilot

These are intentionally not faked by the application:

- Supabase SMS provider and real farmer OTP delivery
- authoritative cadastral/Khasra source and import workflow
- real verifier/operator accounts for end-to-end RLS/RPC testing
- real machine/operator records and device GPS
- production dispatch/OR-Tools service and operational validation
- FIRMS provider key and scheduled ingestion
- WhatsApp/IVR provider credentials and delivery validation
- real buyer/offtake contracts and allocation validation
- production deployment configuration
- field-pilot validation with real operators and farmers

Payments are explicitly outside this release scope.
