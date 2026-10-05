-- NIRDHOOM 2026-10-06 residue quantity invariants.
-- Keep physical inventory and pool accounting valid even if a future client path is added.

alter table public.residue_lots
  alter column quantity_tonnes set not null;

alter table public.residue_lots
  add constraint residue_lots_quantity_positive
  check (quantity_tonnes > 0);

alter table public.residue_lots
  add constraint residue_lots_moisture_pct_range
  check (moisture_pct is null or (moisture_pct >= 0 and moisture_pct <= 100));

alter table public.residue_pools
  add constraint residue_pools_current_not_over_target
  check (current_tonnes <= target_tonnes);

alter table public.residue_pool_members
  add constraint residue_pool_members_commitment_finite
  check (committed_tonnes > 0);
