# NIRDHOOM Operational Chain

## Product spine

NIRDHOOM treats the **Field Job** as the central operational object:

`field → booking → machine → dispatch → GPS → baling → evidence → verification → residue lot → buyer/offtake → impact`

The Field Jobs surface is the control plane for this chain. It reads authorized live Supabase records for jobs, evidence assets and residue lots and highlights the next action, deadline risk, evidence gaps and buyer readiness.

## Live today

- Supabase Auth phone OTP in live mode.
- Explicit farmer operational consent is recorded in `public.consents` and reflected in `profiles.consent_status`.
- Field provenance/trust surface.
- Live field and machine records when demo mode is disabled.
- Live job, evidence and residue-lot visibility subject to RLS.
- Operator GPS telemetry and private evidence storage.
- Offline evidence queue foundation with SHA-256 metadata.
- Authenticated FIRMS/VIIRS ingestion endpoint.
- Authenticated Open-Meteo weather adapter, now consumed by Harvest Intelligence.
- Server-side dispatch/OR-Tools integration.
- Residue pooling and buyer-demand workflow.
- Verification and impact/research readiness surfaces.
- Automated syntax, audit, unit-test, build and dispatch-service CI.

## Explicitly simulated / not money-moving

- Payment initiation and settlement.
- UPI receipts/VPA examples.
- Demo farmer profiles and synthetic operational scenarios.
- Carbon-credit issuance, registry certificates and external methodology eligibility.
- Demo satellite/fire observations.
- Demo biometric, bank and identity-provider steps.

The UI must never present these simulated surfaces as completed real-world transactions.

## Remaining external dependencies

These require provider/authority credentials, contracts, or operational deployment rather than more UI:

1. Authoritative cadastral geometry import/export from the relevant land-record authority.
2. Production Telegram bot configuration, webhook secret and approved farmer messaging flows.
3. Production Punjabi voice/IVR provider, if used.
4. Buyer contract/offtake operations and physical logistics.
5. Real payment-provider integration, when intentionally brought into scope.
6. Formal carbon methodology selection, MRV protocol, registry relationship and third-party verification.
7. Fresh-project migration rehearsal plus adversarial RLS testing with real role accounts.
8. Android field-device pilot for GPS, offline sync, camera/storage and poor-connectivity behavior.
9. Production monitoring, alerting and incident-response runbooks.
10. Vercel/production deployment configuration and supervised end-to-end pilot testing.

## Truthfulness rules

- FIRMS/VIIRS is a thermal observation layer, not proof that a specific field did or did not burn.
- A displayed capacity estimate is not a guaranteed booking until a server-side capacity reservation succeeds.
- A residue estimate based on acreage is a planning coefficient unless backed by measured lot weight.
- A verification record is not a government, registry or Verra certificate.
- Buyer readiness means the operational chain has sufficient linked records; it does not mean payment has occurred.
