# NIRDHOOM — Product Release Readiness Checklist

## Product
- [x] Farmer-first five-step journey
- [x] Mobile navigation and readable touch targets
- [x] Farmer booking workflow
- [x] Operator GPS/evidence primitives
- [x] Dispatch foundation
- [x] Layered verification
- [x] Residue pooling/offtake foundation
- [x] Telegram farmer channel
- [x] Hindi/Punjabi-friendly surfaces
- [x] Demo/live data separation
- [x] Payment movement disabled
- [x] Accessible workspace loading state
- [x] Lazy-loaded secondary/3D workspaces
- [x] Product-first public shell with presentation-only surfaces removed

## Reliability
- [x] Server-authoritative booking boundary
- [x] Supabase RLS/security migrations
- [x] Evidence file validation
- [x] Telegram webhook secret + idempotency
- [x] Telegram Mini App server-side verification
- [x] Live field UUID separated from display ID
- [x] CI audit/test/build gates
- [ ] Final production deployment must be green on the latest commit
- [ ] Real production OTP test using the team's own phone
- [ ] Real Telegram bot webhook/link test
- [ ] Supervised end-to-end field-pilot validation

## Research-backed problem proof

Use the following evidence in the pitch, with the caveat that these are research findings rather than NIRDHOOM performance claims:

- CEEW's 2026 Punjab study reports 86% of surveyed farmers had never heard of Unnat Kisan and highlights practical, behavioural and trust barriers to CRM adoption.
- CEEW's 2025 CHC study reports only about 15% of farmers practising in-situ CRM accessed CHC services in the cited evidence, while many CHCs still rely on phone/in-person coordination.
- CEEW reports an all-inclusive CRM rental package around INR 2,000/acre in Punjab; this is useful market context, not a NIRDHOOM price.
- The product thesis should therefore be stated as a coordination/evidence layer, not as another generic farmer app.

## Launch validation
- [ ] Verify the deployed site from an external device
- [ ] Capture final product screenshots
- [ ] Complete a real Telegram bot webhook/link test
- [ ] Complete a supervised end-to-end field-pilot validation

## Evidence discipline

The prototype should always distinguish:
**demo data → farmer-declared data → machine telemetry → server-authoritative booking → uploaded evidence → remote-sensing observation → human verification → provider-settled payment record.**

A judge should be able to ask "Is that live?" and receive an immediate, accurate answer.

## Final release gate

Run:

```bash
npm run syntaxcheck
npm run audit
npm test
npm run build
```

Then test the deployed site on:
- iPhone-sized viewport
- Android-sized viewport
- desktop
- slow network
- logged-out state
- demo mode
- live mode

Do not publish a competition URL until the latest deployment and the actual browser demo have both been checked.
