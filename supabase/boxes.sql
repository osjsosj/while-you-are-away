-- Server-hosted letter boxes. Run once in the Supabase SQL Editor (after drafts.sql).
--
-- The sender's content lives in public.drafts (one row per user, already synced).
-- A "box" is the published, shareable view of that draft, reached by a secret link.
-- Recipients never talk to Supabase directly: /api/box reads with the service role,
-- applies unlock dates on the server, and signs media URLs.

-- 1. Boxes ----------------------------------------------------------------
create table if not exists public.boxes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  share_token text not null unique,          -- the secret in /b/<token>
  stripe_session_id text not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.boxes enable row level security;
create policy "boxes_select_own" on public.boxes for select using (auth.uid() = user_id);

-- 2. Replies from the recipient -------------------------------------------
create table if not exists public.box_replies (
  id uuid primary key default gen_random_uuid(),
  box_user_id uuid not null references public.boxes (user_id) on delete cascade,
  item_id text not null,                     -- e.g. "w0", "s1", "d:<diary id>"
  body text not null check (char_length(body) <= 5000),
  created_at timestamptz not null default now()
);
create index if not exists box_replies_box_idx on public.box_replies (box_user_id, created_at desc);
alter table public.box_replies enable row level security;
create policy "replies_select_own" on public.box_replies for select using (auth.uid() = box_user_id);

-- 3. Which items the recipient has opened ---------------------------------
create table if not exists public.box_opens (
  box_user_id uuid not null references public.boxes (user_id) on delete cascade,
  item_id text not null,
  opened_at timestamptz not null default now(),
  primary key (box_user_id, item_id)
);
alter table public.box_opens enable row level security;
create policy "opens_select_own" on public.box_opens for select using (auth.uid() = box_user_id);

-- 4. Media storage (photos, voice, video) ---------------------------------
-- Private bucket, 50 MB per file. Each user writes only inside their own folder: <user id>/...
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

create policy "media_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
