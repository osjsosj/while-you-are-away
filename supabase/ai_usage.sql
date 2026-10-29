-- Writing-companion usage per letter box (keeps one box from running up unlimited AI calls).
-- Only the server reads or writes it.
create table if not exists public.ai_usage (
  session_id text primary key,
  messages integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.ai_usage enable row level security;
