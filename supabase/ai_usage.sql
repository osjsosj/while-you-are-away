-- AI usage counters (api/_lib/access.js). Only the server reads or writes it.
-- Keys: "<paid session>:<kind>", "user:<id>:<kind>" (free allowance), "addr:<ip>:<day>" (calls from one
-- network address), "addr:<ip>:<day>:accounts" (which accounts used the AI from it; ids in `note`).
create table if not exists public.ai_usage (
  session_id text primary key,
  messages integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.ai_usage add column if not exists note text;
alter table public.ai_usage enable row level security;
