-- Additive only. Private contact fields are never selected by public endpoints.
CREATE TABLE IF NOT EXISTS cv_members (
 id TEXT PRIMARY KEY,
 request_key TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE,
 phone TEXT NOT NULL,
 first_name TEXT NOT NULL,
 city TEXT NOT NULL,
 craft TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('artist','member')),
 instagram TEXT NOT NULL DEFAULT '',
 tiktok TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','hidden')),
 email_verified_at TEXT,
 confirmation_hash TEXT NOT NULL,
 confirmation_expires_at TEXT NOT NULL,
 welcome_status TEXT NOT NULL DEFAULT 'pending' CHECK(welcome_status IN ('pending','sent','failed')),
 welcome_message_id TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS cv_members_public ON cv_members(status,created_at);
CREATE TABLE IF NOT EXISTS cv_join_limits (
 bucket TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
