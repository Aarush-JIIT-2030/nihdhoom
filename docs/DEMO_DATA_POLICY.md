# Demo data and live-service policy

NIRDHOOM is a field-first product prototype. A polished screen is not evidence that an external service is connected or that a transaction is operational.

## Data labeling
- Clearly label seeded farmers, phone numbers, machines, buyer offers, payouts, and carbon listings as fictional demo data.
- Never present sample identities, indicative quotes, simulated GPS, or placeholder evidence as verified field records.
- Keep demo fixtures separate from production configuration and never copy real personal data into committed seeds or screenshots.
- Preserve source, timestamp, and verification state for any future real-world record.

## Service boundaries
- A disabled or unconfigured payment path must fail closed; do not imply that money was transferred.
- A heuristic dispatch result is a proposal until validated against live fleet, field, and route constraints.
- Uploaded evidence is not verified merely because it exists; verification requires an explicit audit workflow.
- AI responses must not bypass authorization or disclose private field records.

## Release checklist
- [ ] Demo mode is visible wherever seeded records appear.
- [ ] Missing integrations show an explicit unavailable/unconfigured state.
- [ ] No secret or service-role key is exposed to the browser.
- [ ] Role and ownership checks are enforced server-side.
- [ ] Payment, evidence, and verification states are not inferred from UI-only actions.
- [ ] E2E tests cover the primary farmer and operator journeys.

Do not enable a production integration until its authentication, authorization, failure handling, audit trail, and reconciliation behavior have been reviewed.