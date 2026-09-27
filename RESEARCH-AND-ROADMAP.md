# NIRDHOOM deep research + product roadmap (2026-09-27)

## 1. What the original NIRDHOOM material already gives us

The supplied app source already contains the core thesis: farmer demand capture, constrained dispatch, field baling, remote-sensing audit, residue offtake and carbon/evidence surfaces. It also contains source-derived demo records for fields, machines, buyers and yards.

The rebuild should therefore **not** become a generic agri marketplace. Its identity should remain:

> field → clearance → machine → evidence → residue lot → buyer → settlement

## 2. Current policy / infrastructure context to design around

### Punjab CRM is an operations problem, not only an awareness problem

The CAQM Punjab 2026-27 action plan explicitly includes village/block/district-wise mapping of CRM machinery demand and reports 158,898 machines as the baseline, with a 15,000-machine 2026-27 target under the relevant activity. This supports making NIRDHOOM's dispatch layer a demand/capacity map rather than a decorative map.

### Subsidized/custom-hiring infrastructure matters

PIB describes 50% assistance for individual farmers and 80% assistance for eligible Custom Hiring Centre projects under the crop-residue machinery program, and the program includes balers/rakes for ex-situ straw collection. This supports the asset-light/CHC network thesis, but NIRDHOOM must show the actual machine owner, availability, utilization and service rules rather than merely claim “idle machinery”.

### AgriStack changes the farmer identity model

The Digital Agriculture Mission is building Farmer Registry, Crop Sown Registry and geo-referenced village maps. A PIB update from August 2026 reported more than 10.31 crore Farmer IDs nationally and emphasized consent-based sharing and state ownership of farmer data. NIRDHOOM should therefore design a consent-first farmer identity layer and avoid collecting/storing Aadhaar data itself unless there is a clearly justified, compliant integration.

## 3. UX benchmarks found online

### Machine + field operations

John Deere Operations Center connects fields, machines and operators, and emphasizes field boundaries, work planning, machine location, work documentation, notifications and near-real-time monitoring. NIRDHOOM should borrow these **interaction patterns**, not the visual brand: map first, current job first, exceptions/alerts, and proof of completed work.

### Farmer-first information density

DeHaat's current farmer app combines farm mapping/satellite monitoring, weather/advisories and market information. NIRDHOOM should keep only the parts directly useful to residue clearance: field status, weather window, machine status and residue market.

## 4. Remote sensing rule

NASA FIRMS/VIIRS is useful evidence, but the VIIRS active-fire product is 375 m resolution and only observes during satellite overpasses. A detection is therefore a thermal observation, not a precise field perimeter; a missing detection is not proof that a field did not burn.

NIRDHOOM's verification UI should always show:

- source/sensor
- observation timestamp
- geometry/intersection method
- confidence when supplied by the source
- cloud/coverage limitations when applicable
- field/operator evidence
- human review status

## 5. Product improvements that should now be prioritized

### P0 — make the core transaction real

1. Farmer phone OTP + consent
2. Farmer profile + Farmer ID/land-link reference (without storing raw Aadhaar)
3. Real field polygon capture / verified cadastral source
4. Booking capacity engine
5. Machine assignment
6. Operator job state machine
7. Evidence uploads
8. Payment ledger + provider webhook reconciliation

### P1 — make operations reliable

9. Live GPS pings
10. Offline operator queue with retry/sync
11. Dispatch optimizer using deadline, distance, capacity, machine status and service area
12. Weather-aware exception queue
13. Notifications: booking, machine assigned, arrival, completion, verification, payment
14. Human escalation path when a machine fails or misses a slot

### P1 — make residue actually sellable

15. Residue lot creation after clearance
16. Moisture/quality capture
17. Buyer eligibility filters
18. Buyer offer records
19. Acceptance + pickup + settlement
20. Storage-yard inventory and dwell-time alerts

### P2 — evidence and carbon

21. Remote-sensing ingestion
22. Evidence timeline
23. Reviewer workflow
24. Immutable-ish audit trail / append-only event model
25. Carbon methodology configuration
26. Eligibility/additionality/chain-of-custody checks
27. Registry/verification integration only after methodology is finalized

### P2 — farmer intelligence

28. NIRDHOOM Sathi connected to live records
29. Punjabi/Hindi/English text
30. Voice/WhatsApp channel
31. Weather + harvest-window reasoning
32. Explainable answers: “I said this because your booking/machine/weather record says…”

## 6. Important architecture change

Keep the farmer UI and network UI separate even though they share the database:

```text
FARMER APP
  Fields
  Book
  Track
  Evidence
  Payment
  Residue
  Sathi

NETWORK APP
  Dispatch
  Operators
  Machines
  Verification
  Buyers
  Yards
  Carbon

SHARED DATA LAYER
  Farmer
  Field
  Booking
  Machine
  Events
  Evidence
  Lot
  Buyer
  Offer
  Payment
  Notification
```

## 7. What NOT to add yet

- More decorative 3D dashboards
- Fake live counters
- Fake satellite “proof” badges
- Fake UPI/payment confirmations
- Fake buyer bids
- Carbon-credit numbers presented as issued credits
- Large generic AI chat without access to real records
- A giant admin dashboard that the farmer never needs

## 8. Final product north star

NIRDHOOM should answer one question extremely well:

> **“I have harvested / I am about to harvest. How do I get this field cleared on time, know who is coming, prove what happened, get paid, and find a real destination for the residue?”**

Everything else should support that loop.
