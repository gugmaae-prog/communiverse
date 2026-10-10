-- Additive shared credentials, account sessions, reviewed assistant drafts and notification delivery.
CREATE TABLE IF NOT EXISTS cv_accounts(identity_id TEXT PRIMARY KEY,member_id TEXT UNIQUE,staff_id TEXT UNIQUE,username TEXT NOT NULL COLLATE NOCASE UNIQUE,salt TEXT NOT NULL,password_hash TEXT NOT NULL,iterations INTEGER NOT NULL DEFAULT 100000,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cv_account_sessions(hash TEXT PRIMARY KEY,identity_id TEXT NOT NULL REFERENCES cv_accounts(identity_id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS cv_account_session_identity ON cv_account_sessions(identity_id);
CREATE TABLE IF NOT EXISTS cv_assistant_drafts(id TEXT PRIMARY KEY,identity_id TEXT NOT NULL,kind TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',result_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cv_notification_delivery(source_id TEXT PRIMARY KEY,identity_id TEXT NOT NULL,target TEXT NOT NULL,message TEXT NOT NULL,state TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,provider_id TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cv_admin_deleted(id TEXT PRIMARY KEY,kind TEXT NOT NULL,actor_id TEXT NOT NULL,deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cv_admin_audit(id TEXT PRIMARY KEY,actor_id TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TRIGGER IF NOT EXISTS cv_notifications_delivery AFTER INSERT ON cv_workspace_notifications BEGIN INSERT OR IGNORE INTO cv_notification_delivery(source_id,identity_id,target,message) VALUES(NEW.id,NEW.staff_id,NEW.target,NEW.message); END;
CREATE TRIGGER IF NOT EXISTS cv_connect_delivery AFTER INSERT ON cv_connect_notifications BEGIN INSERT OR IGNORE INTO cv_notification_delivery(source_id,identity_id,target,message) VALUES(NEW.id,NEW.identity_id,NEW.target,NEW.message); END;

CREATE TABLE IF NOT EXISTS cv_admin_media_cleanup(object_key TEXT PRIMARY KEY,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
