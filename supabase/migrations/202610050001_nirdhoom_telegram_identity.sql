-- NIRDHOOM Telegram identity/linking layer.
-- Telegram chat IDs are operational identifiers and must never be treated as proof of farmer identity.

create table if not exists public.telegram_identities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  telegram_user_id bigint not null unique,
  telegram_chat_id bigint not null unique,
  username text,
  first_name text,
  language_code text,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  notification_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists telegram_identities_profile_idx
  on public.telegram_identities(profile_id);

alter table public.telegram_identities enable row level security;

drop policy if exists "users read own telegram identity" on public.telegram_identities;
create policy "users read own telegram identity"
on public.telegram_identities for select to authenticated
using (profile_id=(select auth.uid()));

drop policy if exists "users update own telegram notification preference" on public.telegram_identities;
create policy "users update own telegram notification preference"
on public.telegram_identities for update to authenticated
using (profile_id=(select auth.uid()))
with check (profile_id=(select auth.uid()));

create table if not exists public.telegram_link_tokens (
  token_hash text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists telegram_link_tokens_profile_idx
  on public.telegram_link_tokens(profile_id);

alter table public.telegram_link_tokens enable row level security;

-- Link tokens are created/consumed only by server-side API routes.
revoke all on public.telegram_identities from anon, authenticated;
grant select, update on public.telegram_identities to authenticated;
revoke all on public.telegram_link_tokens from public, anon, authenticated;

create or replace function public.consume_telegram_link_token(
  p_token_hash text,
  p_telegram_user_id bigint,
  p_telegram_chat_id bigint,
  p_username text default null,
  p_first_name text default null,
  p_language_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  token_row public.telegram_link_tokens%rowtype;
  linked_profile uuid;
begin
  select * into token_row
  from public.telegram_link_tokens
  where token_hash=p_token_hash
    and used_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Telegram link token is invalid or expired';
  end if;

  insert into public.telegram_identities(
    profile_id, telegram_user_id, telegram_chat_id, username, first_name, language_code
  )
  values (
    token_row.profile_id, p_telegram_user_id, p_telegram_chat_id,
    nullif(left(p_username,255),''), nullif(left(p_first_name,255),''),
    nullif(left(p_language_code,32),'')
  )
  on conflict (telegram_user_id) do update set
    profile_id=excluded.profile_id,
    telegram_chat_id=excluded.telegram_chat_id,
    username=excluded.username,
    first_name=excluded.first_name,
    language_code=excluded.language_code,
    linked_at=now(),
    last_seen_at=now(),
    notification_enabled=true;

  update public.telegram_link_tokens
  set used_at=now()
  where token_hash=p_token_hash;

  select profile_id into linked_profile
  from public.telegram_identities
  where telegram_user_id=p_telegram_user_id;

  return linked_profile;
end;
$$;

revoke all on function public.consume_telegram_link_token(text,bigint,bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.consume_telegram_link_token(text,bigint,bigint,text,text,text) to service_role;
