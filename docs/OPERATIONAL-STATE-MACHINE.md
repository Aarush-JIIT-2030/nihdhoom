# NIRDHOOM Operational State Machine

NIRDHOOM uses one canonical lifecycle for a field clearance job. UI labels may be friendlier, but they must map to these states.

```
REGISTERED
  ↓
BOOKED
  ↓
MACHINE_ASSIGNED
  ↓
ON_THE_WAY
  ↓
ARRIVED
  ↓
BALING
  ↓
PROOF_PENDING
  ↓
COMPLETED
  ↓
CLEARED_PENDING_AUDIT
  ↓
VERIFIED_NON_BURN
  ↓
RESIDUE_AVAILABLE
  ↓
BUYER_ALLOCATED
  ↓
DISPATCHED
```

## Exception states
- `FAILED` — operation failed and requires recovery.
- `CANCELLED` — booking/job was intentionally cancelled.
- `REVIEW_REQUIRED` — evidence or verification needs human review.

## Rules
1. A job must not skip from booking directly to verified residue.
2. Verification requires evidence and an authorized verifier.
3. Residue becomes marketable only after the verification gate.
4. Buyer allocation does not mean payment has occurred.
5. Dispatch does not mean settlement has occurred.
6. Demo mode may simulate transitions locally but must display that the state is simulated.
7. Frontend labels such as “scheduled” are presentation labels only; the persisted domain value should be `BOOKED`.
