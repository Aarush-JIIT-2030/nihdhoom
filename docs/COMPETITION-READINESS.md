# NIRDHOOM — Competition Readiness Checklist

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
- [x] Competition pitch center

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

## Competition presentation
- [x] RIDE startup story
- [x] WarriorHacks community-solution story
- [x] 2-minute demo route
- [x] Judge defence with truth boundaries
- [x] No payment/settlement overclaims
- [ ] Record final demo video
- [ ] Capture final screenshots
- [ ] Verify live demo URL from an external device
- [ ] Complete each event's final form/track selection

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
