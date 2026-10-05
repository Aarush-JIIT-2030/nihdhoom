-- NIRDHOOM Telegram webhook idempotency
create table if not exists public.telegram_webhook_updates (
  update_id bigint primary key,
  received_at timestamptz not null default now()
);

alter table public.telegram_webhook_updates enable row level security;
revoke all on public.telegram_webhook_updates from anon, authenticated, public;
