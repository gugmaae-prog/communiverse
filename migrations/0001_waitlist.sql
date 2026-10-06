-- Already applied to D1 database communiverse-waitlist (migration name 0001_waitlist.sql).
CREATE TABLE waitlist_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 254),
  subject TEXT NOT NULL CHECK(length(subject) BETWEEN 1 AND 160),
  message TEXT NOT NULL CHECK(length(message) BETWEEN 8 AND 4000),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'test')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX waitlist_email ON waitlist_submissions(email);
CREATE INDEX waitlist_created_at ON waitlist_submissions(created_at);
