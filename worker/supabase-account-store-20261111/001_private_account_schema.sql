-- Private, lossless landing schema for Communiverse's D1 account records.
-- No browser role receives access. Application cutover requires a separate verified release.
create schema if not exists communiverse;
revoke all on schema communiverse from public, anon, authenticated;
grant usage on schema communiverse to service_role;

create table communiverse.cv_members (
  id text primary key,
  request_key text not null unique,
  email text not null unique,
  phone text not null,
  first_name text not null,
  city text not null,
  craft text not null,
  kind text not null check (kind in ('artist', 'member')),
  instagram text not null default '',
  tiktok text not null default '',
  status text not null default 'active' check (status in ('active', 'hidden')),
  email_verified_at text,
  confirmation_hash text not null,
  confirmation_expires_at text not null,
  welcome_status text not null default 'pending' check (welcome_status in ('pending', 'sent', 'failed')),
  welcome_message_id text,
  created_at text not null default (now() at time zone 'utc')::text
);

create table communiverse.cv_staff (
  id text primary key,
  username text not null unique,
  name text not null,
  role text not null,
  title text not null,
  region text not null default '',
  profile_slug text not null default '',
  salt text not null,
  password_hash text not null,
  iterations integer not null default 100000,
  status text not null default 'active'
);

create table communiverse.cv_accounts (
  identity_id text primary key,
  member_id text unique,
  staff_id text unique,
  username text not null,
  salt text not null,
  password_hash text not null,
  iterations integer not null default 100000,
  created_at text not null default (now() at time zone 'utc')::text
);
create unique index cv_accounts_username_nocase on communiverse.cv_accounts (lower(username));

create table communiverse.cv_account_sessions (
  hash text primary key,
  identity_id text not null references communiverse.cv_accounts(identity_id) on delete cascade,
  expires_at bigint not null
);
create index cv_account_sessions_expiry on communiverse.cv_account_sessions (expires_at);

create table communiverse.cv_google_identities (
  identity_id text primary key,
  member_id text not null
);
create table communiverse.cv_google_flows (
  hash text primary key,
  verifier text not null,
  expires_at bigint not null,
  browser_hash text not null default ''
);
create table communiverse.cv_google_pending (
  hash text primary key,
  identity_id text not null,
  email text not null,
  first_name text not null,
  expires_at bigint not null
);
create table communiverse.cv_identity_profiles (
  identity_id text primary key,
  profile_slug text not null unique,
  name text not null,
  photo_url text not null default '',
  photo_key text not null default '',
  photo_type text not null default '',
  photo_version integer not null default 1,
  updated_at text not null default (now() at time zone 'utc')::text
);
create table communiverse.cv_login_links (
  hash text primary key,
  member_id text not null,
  expires_at bigint not null
);
create table communiverse.cv_member_preferences (
  member_id text primary key,
  region text not null default '',
  intent text not null default 'member',
  bio text not null default ''
);
create table communiverse.cv_profile_details (
  identity_id text primary key,
  public_title text not null default '',
  bio text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  revision integer not null default 1,
  updated_at text not null default (now() at time zone 'utc')::text
);
create table communiverse.cv_identity_contacts (
  identity_id text primary key,
  email text not null default '',
  phone text not null default '',
  email_verified integer not null default 0,
  pending_email text not null default '',
  confirmation_hash text,
  confirmation_expires_at bigint,
  updated_at text not null default (now() at time zone 'utc')::text
);
create table communiverse.cv_profile_connections (
  identity_id text not null,
  provider text not null check (provider in ('google', 'linkedin_oidc')),
  issuer text not null,
  subject text not null,
  auth_identity text not null,
  email text not null,
  connected_at text not null default (now() at time zone 'utc')::text,
  primary key (identity_id, provider),
  unique (issuer, provider, subject),
  unique (provider, auth_identity)
);
create table communiverse.cv_profile_link_flows (
  hash text primary key,
  identity_id text not null,
  provider text not null,
  verifier text not null,
  browser_hash text not null,
  session_hash text not null,
  return_path text not null,
  expires_at bigint not null
);
create table communiverse.cv_welcome_progress (
  identity_id text primary key,
  status text not null check (status in ('started', 'skipped', 'completed')),
  started_at text not null default (now() at time zone 'utc')::text,
  finished_at text
);

-- A cutover is blocked until the source rows and counts have been checked.
create table communiverse.migration_reconciliation (
  source_database text primary key,
  source_captured_at timestamptz,
  source_schema_sha256 text,
  source_accounts integer,
  target_accounts integer,
  source_members integer,
  target_members integer,
  verified_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'verified'))
);

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'communiverse' loop
    execute format('alter table communiverse.%I enable row level security', t.tablename);
    execute format('revoke all on communiverse.%I from public, anon, authenticated', t.tablename);
    execute format('grant select, insert, update, delete on communiverse.%I to service_role', t.tablename);
  end loop;
end $$;

alter default privileges in schema communiverse revoke all on tables from public, anon, authenticated;
alter default privileges in schema communiverse grant select, insert, update, delete on tables to service_role;
