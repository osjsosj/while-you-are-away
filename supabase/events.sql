-- First-party funnel events (page views, funnel steps, payments).
-- No names, emails, letter text or box tokens are ever stored here.
-- Only the server (service role) writes or reads it.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  anon_id text,   -- random id kept in the visitor browser; null for recipient boxes and when DNT / GPC is on
  path text,      -- normalized route, e.g. /interview (never a box token)
  src text,       -- first-touch utm_source or referrer host
  medium text,
  campaign text,
  props jsonb not null default '{}'::jsonb
);
create index if not exists events_name_created_idx on public.events (name, created_at desc);
create index if not exists events_anon_idx on public.events (anon_id, created_at);
alter table public.events enable row level security;
