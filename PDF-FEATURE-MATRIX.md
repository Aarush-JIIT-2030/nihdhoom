# PDF → NIRDHOOM V6 feature matrix

The attached six-page **Parali: The Reframe** brief is the source of the product decisions below. The strongest requirements are on pages 1–6: dispatch over subsidised machinery, certainty/penalty, per-acre dynamic pricing, harvest forecasting, multi-offtake, verification, farmer-first channels, P0/P1/P2 tiers, PostGIS, queues, phone OTP, payouts, FIRMS, Sentinel-2, OR-Tools and the four-beat demo narrative.

| PDF requirement | Page | V6 treatment |
|---|---:|---|
| Route idle subsidised machinery | 1 | Dispatch surface + machine data + `/api/dispatch` + OR-Tools service hook |
| Guaranteed clearance date + penalty | 2 | Dynamic quote + guarantee/penalty fields + booking object |
| Price by time, pay per acre | 2 | `/api/quote`, per-acre quote, quote metadata |
| Harvest forecast before it happens | 2, 5 | Harvest intelligence + forecast schema; Sentinel-2 connector remains external |
| Multi-offtake auction | 2, 4 | Buyer pathways + open offers + buyer contracts + dispatch/yard schema |
| Field-level verification | 2 | Evidence, FIRMS adapter, PostGIS boundary, audit flow |
| Carbon downstream of evidence | 2–3, 5 | Carbon chain surface + no-premature-crediting rule |
| Soil as interface layer, not cheap hardware | 4 | Soil report schema + intelligence surface; no fake sensor |
| WhatsApp + IVR first | 4–6 | WhatsApp Cloud API server adapter; IVR provider remains a deployment integration |
| Offline operator PWA | 4 | Local state/proof queue + online/offline state + real GPS/upload path |
| Centre operator / buyer / ops surfaces | 4 | Network modal and operational surfaces; buyer/yard data model added |
| P0 field registration | 4 | Khasra, variety, harvest date, acreage, real lat/lng boundary capture |
| P0 immediate guaranteed pickup quote | 4 | Quote endpoint + booking contract object |
| P0 dispatch engine | 4 | Dispatch API + production OR-Tools hook |
| P0 QR lot + UPI payout | 4 | QR-tagged residue lot + payment ledger/webhook foundation |
| P0 FIRMS field intersection | 4–5 | FIRMS ingestion endpoint + PostGIS boundary; spatial match job is the next worker step |
| P1 credits wallet | 4 | Wallet + transactions schema and UI |
| P1 soil action plan + Punjabi voice | 4 | Soil schema + Sathi/voice channel foundation |
| P1 bale inventory / moisture safety | 4 | Residue lot moisture, yard and inventory schema |
| P1 buyer contracts / auction | 4 | Buyer contracts, offers and dispatch schema |
| P2 carbon ledger | 4 | Carbon evidence-chain surface and roadmap |
| P2 farmer credit scoring | 4 | Intentionally not scored in the UI; schema can be added after reliable delivery history |
| Postgres + PostGIS | 5 | PostGIS extension + geography polygon + GIST index |
| Redis/BullMQ or Celery | 5 | Dispatch service hook; background worker remains deployable separately |
| Phone OTP | 5 | Supabase phone OTP + consent |
| RazorpayX/Cashfree payout | 5 | Provider-ready ledger + signed webhook adapter; credentials required for live settlement |
| NASA FIRMS | 5 | Server-side API adapter using MAP_KEY |
| Sentinel-2/Bhuvan | 5 | Forecast model + connector placeholder, no invented satellite result |
| OR-Tools VRPTW | 5 | Dispatch service hook and fallback; production solver can be mounted at `DISPATCH_SERVICE_URL` |
| WhatsApp Cloud API + IVR | 5 | WhatsApp server adapter; IVR still needs a telephony provider account |
| Four demo beats | 5 | Booking, dispatch, operator proof/GPS, verification surfaces now exist as one connected narrative |
| Pilot geography | 6 | Demo records remain Sangrur-focused; pilot scope should be explicitly selected before production |
| CBG + mushroom offtake | 6 | Both are represented in demo buyer pathways |
| Scope discipline | 6 | Farmer loop remains primary; soil/workshops are secondary surfaces rather than the homepage |

## V7 implementation pass

V7 closes the highest-value operational gaps from the brief rather than expanding the dashboard:

- **Guaranteed booking is transactional:** `reserve_clearance_booking()` locks the farmer-owned field/date booking, requires active consent, prevents duplicate active reservations and stores the quote/penalty object.
- **Dispatch assigns live bookings:** the dispatch surface reads authenticated bookings and fleet state, calls the dispatch service, then creates/updates the job and machine assignment records.
- **Operator execution is state-controlled:** `transition_job()` enforces `ASSIGNED → ARRIVED → BALING → PROOF_PENDING → COMPLETED`; arrival can be blocked by GPS distance on the client and is role-gated again in the database.
- **Evidence has integrity metadata:** uploads include booking/field linkage, GPS, GPS accuracy, timestamp, SHA-256 and storage provenance.
- **Residue becomes traceable:** lots now link back to booking/job, carry weight/moisture/QR information and can be atomically allocated to an accepted buyer offer.
- **Verification is reviewable:** FIRMS observations, evidence count and residue custody are stored in the verification decision metadata; a verifier must record the final result.
- **Payments reconcile from webhooks:** the webhook verifies an HMAC signature and can reconcile the payment ledger using a server-only Supabase service key. The browser never marks a payout as paid.
- **Failure paths are explicit:** payment initiation refuses to pretend a provider exists; offline proof is queued; provider/API credentials remain deployment requirements.
