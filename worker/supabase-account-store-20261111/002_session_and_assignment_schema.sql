-- Additional legacy session, artist assignment, and rate-limit state used by
-- the current account/workspace runtime. Kept private during the cutover.
create table communiverse.cv_sessions (
  hash text primary key,
  member_id text not null,
  expires_at bigint not null
);
create table communiverse.cv_staff_sessions (
  hash text primary key,
  staff_id text not null references communiverse.cv_staff(id),
  expires_at bigint not null
);
create table communiverse.cv_artist_accounts (
  member_id text not null,
  artist_id text not null,
  assigned_by text not null,
  created_at text not null default (now() at time zone 'utc')::text,
  primary key (member_id, artist_id)
);
create table communiverse.cv_profile_rate_limits (
  identity_id text not null,
  action text not null,
  bucket bigint not null,
  hits integer not null,
  primary key (identity_id, action)
);
create table communiverse.cv_join_limits (
  bucket text primary key,
  count integer not null,
  expires_at bigint not null
);

do $$
declare t text;
begin
  foreach t in array array['cv_sessions','cv_staff_sessions','cv_artist_accounts','cv_profile_rate_limits','cv_join_limits'] loop
    execute format('alter table communiverse.%I enable row level security', t);
    execute format('revoke all on communiverse.%I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on communiverse.%I to service_role', t);
  end loop;
end $$;
