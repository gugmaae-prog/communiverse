-- Keep the old member email as contact data while Auth uses a private identity.
alter table communiverse.cv_auth_profiles add column if not exists auth_email text;
create unique index if not exists cv_auth_profiles_auth_email_nocase
  on communiverse.cv_auth_profiles (lower(auth_email)) where auth_email is not null;
