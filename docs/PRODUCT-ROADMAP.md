# NIRDHOOM Product Roadmap

## Product thesis

NIRDHOOM should become the coordination layer between **field demand, machine capacity, evidence, residue aggregation and offtake**. The product should not replace government schemes, CHCs, agronomy systems or buyer contracts; it should make the handoffs between them visible and actionable.

## Evidence-led priorities

- ICAR's September 2026 Punjab stakeholder workshop calls for district-wise matching of machine capacity to actual demand, digital mapping, improved CHC coordination, expanded baler tracking, and stronger aggregation, transport, storage and assured-offtake economics. It also proposes CRM CONNECT as a shared coordination platform. Source: https://www.icar.gov.in/en/punjab-stakeholders-forge-integrates-action-agenda-crop-residue-management
- ICAR's 2025 work stresses region-specific machinery lists, field validation, CHC sustainability and farmer feedback. Source: https://www.icar.gov.in/en/dg-icar-inspires-farmers-inter-state-travelling-seminar-crop-residue-management
- ICAR's custom-hiring research emphasizes lower capital burden, better machine utilization, lower per-unit costs and timely operations. Source: https://icar.gov.in/sites/default/files/2025-11/December_2025%20Indian%20Farming.pdf
- John Deere Operations Center is a useful benchmark for plan → assign → monitor → analyze operations. Source: https://www.deere.com/en-us/products-solutions/technology-solutions/precision-ag-technology/operations-center
- Climate FieldView is a useful benchmark for continuous field-data collection, remote view and sharing. Source: https://climate.com/en-us/solutions/gather-information.html
- DeHaat demonstrates the value of a simple farmer-facing workflow with a human/local last-mile interface. Source: https://agrevolution.in/business-model

## P0 — Pilot-ready coordination

1. **Demand-to-machine matching:** score candidate machines using field deadline, machine capability, distance, operator availability, residue type and stale-GPS status; show why a machine was recommended; keep the recommendation as a proposal until a dispatcher confirms it.
2. **48-hour exception queue:** surface fields with no machine, stale machine location, approaching deadlines, verified residue with no next pathway, and buyer demand without matching verified supply.
3. **Operational job card:** one canonical view for field, machine, operator, time window, GPS freshness, evidence count, residue state and next action.
4. **Baler/operator reliability:** expose start/stop GPS, offline queue state, upload state, last-seen age and sync recovery.
5. **Buyer readiness:** separate lead, conditional offer, matched proposal and confirmed contract; never infer a contract from an offer.

## P1 — Farmer adoption

- Three primary actions: **Book pickup / Track job / My fields**.
- Punjabi, Hindi and English for every primary farmer action.
- Telegram/SMS fallback for important status transitions.
- Human escalation path through CHC/operator/coordinator.
- Progressive disclosure and very small forms.

## P1 — Verification and trust

- Provenance on every consequential field.
- FIRMS/satellite observations remain supporting evidence only.
- Cadastral boundaries remain externally authoritative until verified.
- Evidence hashes and private storage.
- Exportable field record for supervised pilots.

## P2 — Network intelligence

- District demand-versus-capacity map.
- Machine utilization by CHC.
- Travel-time and route efficiency.
- Aggregation radius and storage pressure.
- Buyer demand forecasting.
- Season-over-season operational learning.

## Do not build yet

- Generic AI chat as the primary product.
- Carbon certificates as a revenue promise.
- Payments until a real provider and ledger are connected.
- 3D views that do not change an operational decision.
- Public social feeds.
- More dashboards without a decision attached.
- Presentation-only pitch/demo/judge screens.

## Pilot release gates

- `npm run syntaxcheck`
- `npm run audit`
- `npm test`
- `npm run build`
- Dispatch syntax + tests
- Seeded RLS role-matrix tests
- Telegram secure-link + Mini App HMAC tests
- Supervised field booking test
- Operator evidence upload test
- Real Telegram link/webhook test
- External-device mobile test
- Offline/reconnect test
- Image-load and broken-asset check
- Keyboard/screen-reader accessibility pass
- Production secrets and Supabase migrations verified
- Deployed Vercel build and API routes verified

Source-level checks prove architecture and regression safety; they cannot prove a real-world pilot integration without connected credentials and supervised field validation.
