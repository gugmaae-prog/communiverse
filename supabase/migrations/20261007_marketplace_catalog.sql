-- Prepared for a dedicated Communiverse Supabase project. Not applied: project creation was declined.
-- Public reads are limited to published records; all writes remain owner/admin-only.

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  name text not null check (char_length(name) between 2 and 120),
  discipline text not null check (char_length(discipline) between 2 and 80),
  location text,
  bio text not null default '',
  portrait_url text,
  cover_url text,
  instagram_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  consent_recorded_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artist_publication_requires_consent check (status <> 'published' or (consent_recorded_at is not null and published_at is not null))
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  material text,
  kind text,
  cover_url text,
  price_aed numeric(12,2) check (price_aed is null or price_aed >= 0),
  availability text not null default 'enquire' check (availability in ('enquire', 'available', 'reserved', 'sold')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_publication_timestamp check (status <> 'published' or published_at is not null)
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  discipline text,
  cover_url text,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 15 and 1440),
  capacity integer check (capacity is null or capacity between 1 and 100),
  price_aed numeric(12,2) check (price_aed is null or price_aed >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workshop_publication_timestamp check (status <> 'published' or published_at is not null)
);

create index artists_public_idx on public.artists (published_at desc) where status = 'published';
create index works_public_idx on public.works (published_at desc) where status = 'published';
create index works_artist_idx on public.works (artist_id);
create index workshops_public_idx on public.workshops (published_at desc) where status = 'published';
create index workshops_artist_idx on public.workshops (artist_id);

alter table public.artists enable row level security;
alter table public.works enable row level security;
alter table public.workshops enable row level security;

create policy artists_public_read on public.artists for select to anon, authenticated
  using (status = 'published' and published_at is not null and consent_recorded_at is not null);
create policy works_public_read on public.works for select to anon, authenticated
  using (status = 'published' and published_at is not null and exists (
    select 1 from public.artists a where a.id = artist_id and a.status = 'published'
      and a.published_at is not null and a.consent_recorded_at is not null
  ));
create policy workshops_public_read on public.workshops for select to anon, authenticated
  using (status = 'published' and published_at is not null and exists (
    select 1 from public.artists a where a.id = artist_id and a.status = 'published'
      and a.published_at is not null and a.consent_recorded_at is not null
  ));

revoke all on public.artists, public.works, public.workshops from anon, authenticated;
grant select on public.artists, public.works, public.workshops to anon, authenticated;

comment on table public.artists is 'Consented Communiverse marketplace artist profiles; separate from the existing Plug directory.';
comment on table public.works is 'Approved objects linked to a published marketplace artist; no payment or checkout is implied.';
comment on table public.workshops is 'Approved workshop descriptions; booking dates are managed separately and none are seeded.';
