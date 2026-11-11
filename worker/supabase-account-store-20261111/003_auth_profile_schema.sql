-- Supabase Auth identities are attached to Communiverse members only after
-- Supabase has verified ownership of the email address.
create unique index cv_members_email_nocase on communiverse.cv_members (lower(email));

create table communiverse.cv_auth_profiles (
  auth_user_id uuid primary key,
  member_id text not null unique references communiverse.cv_members(id),
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cv_auth_profiles_username_format check (username ~ '^[a-z0-9][a-z0-9._-]{2,39}$')
);
create unique index cv_auth_profiles_username_nocase on communiverse.cv_auth_profiles (lower(username));
alter table communiverse.cv_auth_profiles enable row level security;
revoke all on communiverse.cv_auth_profiles from public, anon, authenticated;
grant select, insert, update, delete on communiverse.cv_auth_profiles to service_role;
