-- Namespaced additions to the existing Communiverse D1 database.
-- Applications remain in waitlist_submissions; no existing table is altered.
CREATE TABLE IF NOT EXISTS cv_ambassador_profiles (
  slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  public_profile_url TEXT NOT NULL,
  city TEXT,
  verified_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cv_ambassador_activity (
  id TEXT PRIMARY KEY,
  ambassador_slug TEXT NOT NULL REFERENCES cv_ambassador_profiles(slug),
  category TEXT NOT NULL CHECK (category IN ('artisan_introduction','story_published','experience_hosted')),
  title TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  occurred_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_by_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS cv_ambassador_activity_public_idx ON cv_ambassador_activity(ambassador_slug,status,category);

INSERT OR IGNORE INTO cv_ambassador_profiles(slug,display_name,public_profile_url) VALUES
  ('luna','Luna','/communiverse/plug/person/luna/'),
  ('turbooz','@_turbooz','/communiverse/plug/person/turbooz/'),
  ('abdallah-mahmoudd','Abd Allah Mahmoud','/communiverse/plug/person/abdallah-mahmoudd/');
