-- Additive social layer. Contact details and login/session hashes remain private.
CREATE TABLE IF NOT EXISTS cv_login_links(hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cv_sessions(hash TEXT PRIMARY KEY,member_id TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS cv_sessions_expiry ON cv_sessions(expires_at);
CREATE TABLE IF NOT EXISTS cv_catalog(id TEXT PRIMARY KEY,kind TEXT NOT NULL,artist TEXT NOT NULL DEFAULT '',region TEXT NOT NULL DEFAULT '',data TEXT NOT NULL,tags TEXT NOT NULL,checked_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS cv_catalog_kind ON cv_catalog(kind,region);
CREATE TABLE IF NOT EXISTS cv_hearts(member_id TEXT NOT NULL,item_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(member_id,item_id));
CREATE TABLE IF NOT EXISTS cv_follows(member_id TEXT NOT NULL,artist_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(member_id,artist_id));
CREATE TABLE IF NOT EXISTS cv_member_preferences(member_id TEXT PRIMARY KEY,region TEXT NOT NULL DEFAULT '',intent TEXT NOT NULL DEFAULT 'member',bio TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS cv_posts(id TEXT PRIMARY KEY,member_id TEXT NOT NULL,region TEXT NOT NULL,kind TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,url TEXT NOT NULL DEFAULT '',image TEXT NOT NULL DEFAULT '',tags TEXT NOT NULL DEFAULT '[]',status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_posts_region ON cv_posts(region,status,created_at);
CREATE TABLE IF NOT EXISTS cv_comments(id TEXT PRIMARY KEY,member_id TEXT NOT NULL,target TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_comments_target ON cv_comments(target,status,created_at);
CREATE TABLE IF NOT EXISTS cv_reports(member_id TEXT NOT NULL,target TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(member_id,target));
CREATE TABLE IF NOT EXISTS cv_feed_snapshots(id TEXT PRIMARY KEY,member_id TEXT NOT NULL,ids TEXT NOT NULL,expires_at INTEGER NOT NULL);

CREATE INDEX IF NOT EXISTS cv_hearts_item ON cv_hearts(item_id,member_id);
CREATE INDEX IF NOT EXISTS cv_posts_author ON cv_posts(member_id,status);
CREATE INDEX IF NOT EXISTS cv_feed_snapshots_expiry ON cv_feed_snapshots(expires_at);
CREATE INDEX IF NOT EXISTS cv_login_links_member ON cv_login_links(member_id);
CREATE INDEX IF NOT EXISTS cv_join_limits_expiry ON cv_join_limits(expires_at);

CREATE TABLE IF NOT EXISTS cv_hosted_events(id TEXT PRIMARY KEY,member_id TEXT NOT NULL,title TEXT NOT NULL,type TEXT NOT NULL,region TEXT NOT NULL,city TEXT NOT NULL,venue TEXT NOT NULL,description TEXT NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL,url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_hosted_events_region ON cv_hosted_events(region,status,start);
