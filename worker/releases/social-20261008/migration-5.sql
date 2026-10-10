-- Private, additive Google sign-in flow state. No public profile exists before consent.
CREATE TABLE IF NOT EXISTS cv_google_flows(hash TEXT PRIMARY KEY,verifier TEXT NOT NULL,expires_at INTEGER NOT NULL,browser_hash TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS cv_google_flows_expiry ON cv_google_flows(expires_at);
CREATE TABLE IF NOT EXISTS cv_google_pending(hash TEXT PRIMARY KEY,identity_id TEXT NOT NULL,email TEXT NOT NULL,first_name TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS cv_google_pending_expiry ON cv_google_pending(expires_at);
CREATE TABLE IF NOT EXISTS cv_google_identities(identity_id TEXT PRIMARY KEY,member_id TEXT NOT NULL);
