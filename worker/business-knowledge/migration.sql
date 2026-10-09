-- Additive knowledge corpus. No change to existing application tables or sessions.
CREATE TABLE IF NOT EXISTS cv_knowledge_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL CHECK(audience IN ('member','staff','leadership','platform')),
  status TEXT NOT NULL CHECK(status IN ('reference','draft','verified-implementation','archived')),
  source_title TEXT NOT NULL,
  source_ref TEXT NOT NULL DEFAULT '',
  source_date TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS cv_knowledge_documents_visibility ON cv_knowledge_documents(audience,status);
