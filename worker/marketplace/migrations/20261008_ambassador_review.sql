-- Reviewer access is explicitly assigned to a verified espacios.me email.
-- This migration grants nobody access by itself.
CREATE TABLE IF NOT EXISTS cv_staff_reviewers (
  email TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE cv_ambassador_activity ADD COLUMN reviewed_by_email TEXT;
