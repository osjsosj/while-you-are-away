-- Run in Supabase SQL Editor (once per project)

create table if not exists public.drafts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.drafts enable row level security;

create policy "drafts_select_own"
  on public.drafts for select
  using (auth.uid() = user_id);

create policy "drafts_insert_own"
  on public.drafts for insert
  with check (auth.uid() = user_id);

create policy "drafts_update_own"
  on public.drafts for update
  using (auth.uid() = user_id);
