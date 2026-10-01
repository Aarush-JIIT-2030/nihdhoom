-- NIRDHOOM field geometry verification.
-- A farmer-drawn polygon is not authoritative by itself. Only an authorized
-- verifier may promote an imported/cadastral/registry boundary to verified.

create or replace function public.verify_field_geometry(
  p_field_id uuid,
  p_source text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.fields
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  f public.fields%rowtype;
  role_name text;
  area_acres numeric;
  area_delta numeric;
begin
  select role into role_name from public.profiles where id=auth.uid();
  if role_name not in ('verifier','dispatcher','admin') then
    raise exception 'Verifier role required';
  end if;

  if p_source not in ('cadastral','farmer_registry','imported') then
    raise exception 'Only authoritative or imported boundary sources can be verified';
  end if;

  if p_metadata is not null and jsonb_typeof(p_metadata) <> 'object' then
    raise exception 'Verification metadata must be an object';
  end if;

  select * into f from public.fields where id=p_field_id for update;
  if not found then raise exception 'Field not found'; end if;
  if f.boundary is null then raise exception 'Field boundary is required'; end if;

  if not extensions.ST_IsValid(f.boundary::extensions.geometry) then
    raise exception 'Field boundary is not a valid polygon';
  end if;

  if extensions.ST_IsEmpty(f.boundary::extensions.geometry) then
    raise exception 'Field boundary is empty';
  end if;

  area_acres := round((extensions.ST_Area(f.boundary) / 4046.8564224)::numeric, 3);
  if area_acres <= 0 or area_acres > 10000 then
    raise exception 'Field boundary area is outside the supported range';
  end if;

  if f.acreage <= 0 then raise exception 'Registered acreage must be positive'; end if;
  area_delta := abs(area_acres - f.acreage) / greatest(f.acreage, 0.001);
  if area_delta > 0.20 then
    raise exception 'Boundary area differs from registered acreage by more than 20 percent';
  end if;

  update public.fields
  set boundary_source=p_source,
      boundary_verified=true,
      geometry_verified_at=now(),
      geometry_verified_by=auth.uid(),
      geometry_area_acres=area_acres,
      geometry_type='verified',
      updated_at=now()
  where id=p_field_id
  returning * into f;

  insert into public.audit_events(entity_type,entity_id,actor_id,action,before_state,after_state)
  values(
    'field', f.id, auth.uid(), 'FIELD_GEOMETRY_VERIFIED',
    jsonb_build_object('boundary_verified',false),
    jsonb_build_object(
      'boundary_verified',true,
      'boundary_source',p_source,
      'geometry_area_acres',area_acres,
      'metadata',coalesce(p_metadata,'{}'::jsonb)
    )
  );

  return f;
end;
$$;

revoke all on function public.verify_field_geometry(uuid,text,jsonb) from public, anon;
grant execute on function public.verify_field_geometry(uuid,text,jsonb) to authenticated;
