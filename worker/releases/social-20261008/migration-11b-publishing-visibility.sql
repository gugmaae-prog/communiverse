-- Withdrawal affects explicit studio publications only. Source files, private
-- studio records, identity links and original curated gallery works are retained.
UPDATE cv_studio_public_work SET status='hidden'
WHERE status='published' AND EXISTS(
 SELECT 1 FROM cv_members m WHERE m.status<>'active' AND (
  cv_studio_public_work.created_by='member-'||m.id OR
  cv_studio_public_work.artist_id='member-'||m.id OR
  EXISTS(SELECT 1 FROM cv_artist_accounts a WHERE a.member_id=m.id AND a.artist_id=cv_studio_public_work.artist_id) OR
  EXISTS(SELECT 1 FROM cv_connect_files f WHERE f.id=cv_studio_public_work.file_id AND f.uploader_id='member-'||m.id)
 )
);
DELETE FROM cv_catalog WHERE id IN(SELECT id FROM cv_studio_public_work WHERE status='hidden');

CREATE TRIGGER IF NOT EXISTS cv_studio_hide_member_publication
AFTER UPDATE OF status ON cv_members WHEN NEW.status<>'active' AND OLD.status='active'
BEGIN
 UPDATE cv_studio_public_work SET status='hidden' WHERE status='published' AND (
  created_by='member-'||NEW.id OR artist_id='member-'||NEW.id OR
  artist_id IN(SELECT artist_id FROM cv_artist_accounts WHERE member_id=NEW.id) OR
  file_id IN(SELECT id FROM cv_connect_files WHERE uploader_id='member-'||NEW.id)
 );
 DELETE FROM cv_catalog WHERE id IN(SELECT id FROM cv_studio_public_work WHERE status='hidden');
END;

-- Keep publication and ownership validation in the same SQLite transaction.
-- This also blocks a stale publish request racing with account withdrawal.
CREATE TRIGGER IF NOT EXISTS cv_studio_publish_active_owner
BEFORE INSERT ON cv_studio_public_work WHEN EXISTS(
 SELECT 1 FROM cv_members m WHERE m.status<>'active' AND (
  NEW.created_by='member-'||m.id OR NEW.artist_id='member-'||m.id OR
  EXISTS(SELECT 1 FROM cv_artist_accounts a WHERE a.member_id=m.id AND a.artist_id=NEW.artist_id) OR
  EXISTS(SELECT 1 FROM cv_connect_files f WHERE f.id=NEW.file_id AND f.uploader_id='member-'||m.id)
 )
)
BEGIN SELECT RAISE(ABORT,'The artist profile is no longer active'); END;
