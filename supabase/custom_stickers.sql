-- Stickers the library didn't have, drawn by the AI once and reused for everyone (api/sticker.js).
-- `svg` holds only plain shapes (checked by api/_lib/stickerDraw.js before it is stored).
-- Only the server reads or writes it.
create table if not exists public.custom_stickers (
  key text primary key,          -- sha-256 of style + subject
  id text not null unique,       -- "x-" + 12 hex, the public sticker id
  label text not null,           -- what was drawn, in English
  words text not null default '',
  subject text not null,         -- what was asked for
  art text not null,             -- flat | color | noto | twemoji
  svg text not null,
  created_at timestamptz not null default now()
);
alter table public.custom_stickers enable row level security;
