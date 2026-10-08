-- Machine capability provenance: do not invent machinery specifications in the product UI.
alter table public.machines
  add column if not exists tractor_hp_required numeric(6,1),
  add column if not exists residue_types text[] not null default array['PADDY_STRAW']::text[],
  add column if not exists operating_conditions text,
  add column if not exists capability_source text,
  add column if not exists capability_source_date date;

create index if not exists machines_capability_source_idx
  on public.machines(capability_source, capability_source_date);

comment on column public.machines.capability_source is
  'External source used for machine capability claims, e.g. ICAR/PAU/official manufacturer documentation.';
comment on column public.machines.capability_source_date is
  'Publication/retrieval date for the capability source, not an inferred machine inspection date.';
