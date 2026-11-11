-- Communiverse contact details are saved without asserting ownership.
-- Email-confirmed legacy identities keep their existing linkage rules.
alter table communiverse.cv_auth_profiles
  add column if not exists login_kind text not null default 'email',
  add column if not exists contact_email text,
  add column if not exists recovery_code_hash text;

alter table communiverse.cv_auth_profiles
  add constraint cv_auth_profiles_login_kind_check
  check (login_kind in ('email', 'username'));

create table if not exists communiverse.cv_auth_attempts (
  attempt_key text primary key,
  attempts integer not null,
  reset_at timestamptz not null
);
alter table communiverse.cv_auth_attempts enable row level security;
revoke all on communiverse.cv_auth_attempts from public, anon, authenticated;
grant select, insert, update, delete on communiverse.cv_auth_attempts to service_role;
