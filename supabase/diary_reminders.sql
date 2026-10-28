-- Evening diary questions. Run once in the Supabase SQL Editor.
-- Only the server (service role key) reads or writes this table; RLS with no policies blocks everyone else.

create table if not exists public.diary_reminders (
  session_id text primary key,               -- Stripe checkout session (proof of purchase)
  email text not null,
  to_name text,
  part_date date not null,                   -- the day they part; emails stop after this
  enabled boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid(),
  last_sent_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists diary_reminders_token_idx on public.diary_reminders (unsubscribe_token);
create index if not exists diary_reminders_due_idx on public.diary_reminders (enabled, part_date);

alter table public.diary_reminders enable row level security;
