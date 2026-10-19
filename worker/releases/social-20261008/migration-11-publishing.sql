-- Private studio files are published only through an explicit gallery action.
CREATE TABLE IF NOT EXISTS cv_studio_public_work(id TEXT PRIMARY KEY,artist_id TEXT NOT NULL,file_id TEXT NOT NULL REFERENCES cv_connect_files(id),title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',tags TEXT NOT NULL DEFAULT '[]',kind TEXT NOT NULL,price REAL,currency TEXT NOT NULL DEFAULT 'USD',status TEXT NOT NULL DEFAULT 'published',request_key TEXT NOT NULL UNIQUE,created_by TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_studio_public_artist ON cv_studio_public_work(artist_id,status,created_at);

CREATE TRIGGER IF NOT EXISTS cv_studio_publish_active_file BEFORE INSERT ON cv_studio_public_work WHEN NOT EXISTS(SELECT 1 FROM cv_connect_files f WHERE f.id=NEW.file_id AND f.status='active' AND f.target='artist:'||NEW.artist_id) BEGIN SELECT RAISE(ABORT,'The studio file is no longer available'); END;
