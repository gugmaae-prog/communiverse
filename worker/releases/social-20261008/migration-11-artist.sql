-- Artist ownership is verified separately from editable public profile fields.
CREATE TABLE IF NOT EXISTS cv_artist_accounts(member_id TEXT NOT NULL,artist_id TEXT NOT NULL,assigned_by TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(member_id,artist_id));
CREATE UNIQUE INDEX IF NOT EXISTS cv_artist_accounts_owner ON cv_artist_accounts(artist_id);
CREATE TABLE IF NOT EXISTS cv_artist_assignments(artist_id TEXT PRIMARY KEY,ambassador_id TEXT NOT NULL REFERENCES cv_staff(id),assigned_by TEXT NOT NULL REFERENCES cv_staff(id),version INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_artist_assignments_ambassador ON cv_artist_assignments(ambassador_id,artist_id);
CREATE TABLE IF NOT EXISTS cv_artist_business(artist_id TEXT PRIMARY KEY,country TEXT NOT NULL DEFAULT '',city TEXT NOT NULL DEFAULT '',craft TEXT NOT NULL DEFAULT '',bio TEXT NOT NULL DEFAULT '',can_host INTEGER NOT NULL DEFAULT 0,host_setup TEXT NOT NULL DEFAULT '',tags TEXT NOT NULL DEFAULT '[]',version INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cv_artist_products(id TEXT PRIMARY KEY,artist_id TEXT NOT NULL,title TEXT NOT NULL,sku TEXT NOT NULL DEFAULT '',stock INTEGER NOT NULL CHECK(stock>=0),price REAL NOT NULL CHECK(price>=0),currency TEXT NOT NULL,tags TEXT NOT NULL DEFAULT '[]',status TEXT NOT NULL DEFAULT 'active',request_key TEXT NOT NULL UNIQUE,created_by TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_artist_products_artist ON cv_artist_products(artist_id,status);
CREATE TABLE IF NOT EXISTS cv_artist_transactions(id TEXT PRIMARY KEY,artist_id TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('product','workshop','other')),product_id TEXT REFERENCES cv_artist_products(id),quantity INTEGER NOT NULL CHECK(quantity>=1),gross REAL NOT NULL CHECK(gross>=0),refund REAL NOT NULL DEFAULT 0 CHECK(refund>=0 AND refund<=gross),currency TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','paid','cancelled')),occurred_on TEXT NOT NULL,client_country TEXT NOT NULL DEFAULT '',client_city TEXT NOT NULL DEFAULT '',demographics_consent INTEGER NOT NULL DEFAULT 0,notes TEXT NOT NULL DEFAULT '',source TEXT NOT NULL DEFAULT 'manual',request_key TEXT NOT NULL UNIQUE,created_by TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_artist_transactions_artist ON cv_artist_transactions(artist_id,status,occurred_on);
-- Stock changes and ledger writes are in the same transaction, including retries.
CREATE TRIGGER IF NOT EXISTS cv_artist_sale_insert_check BEFORE INSERT ON cv_artist_transactions WHEN NEW.product_id IS NOT NULL BEGIN
 SELECT RAISE(ABORT,'CV_PRODUCT_UNAVAILABLE') WHERE NOT EXISTS(SELECT 1 FROM cv_artist_products WHERE id=NEW.product_id AND artist_id=NEW.artist_id AND currency=NEW.currency AND status='active');
 SELECT RAISE(ABORT,'CV_STOCK_INSUFFICIENT') WHERE NEW.status='paid' AND (SELECT stock FROM cv_artist_products WHERE id=NEW.product_id)<NEW.quantity;
END;
CREATE TRIGGER IF NOT EXISTS cv_artist_sale_insert AFTER INSERT ON cv_artist_transactions WHEN NEW.product_id IS NOT NULL AND NEW.status='paid' BEGIN
 UPDATE cv_artist_products SET stock=stock-NEW.quantity,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=NEW.product_id;
END;
CREATE TRIGGER IF NOT EXISTS cv_artist_sale_update_check BEFORE UPDATE ON cv_artist_transactions BEGIN
 SELECT RAISE(ABORT,'CV_SALE_IMMUTABLE') WHERE NEW.artist_id<>OLD.artist_id OR NEW.kind<>OLD.kind OR NEW.product_id IS NOT OLD.product_id OR NEW.quantity<>OLD.quantity OR NEW.gross<>OLD.gross OR NEW.currency<>OLD.currency OR NEW.occurred_on<>OLD.occurred_on;
 SELECT RAISE(ABORT,'CV_STOCK_INSUFFICIENT') WHERE NEW.product_id IS NOT NULL AND NEW.status='paid' AND OLD.status<>'paid' AND NOT EXISTS(SELECT 1 FROM cv_artist_products WHERE id=NEW.product_id AND artist_id=NEW.artist_id AND stock>=NEW.quantity AND status='active');
END;
CREATE TRIGGER IF NOT EXISTS cv_artist_sale_update AFTER UPDATE OF status ON cv_artist_transactions WHEN NEW.product_id IS NOT NULL AND NEW.status<>OLD.status BEGIN
 UPDATE cv_artist_products SET stock=stock+(OLD.status='paid')*OLD.quantity-(NEW.status='paid')*NEW.quantity,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=NEW.product_id;
END;
CREATE TABLE IF NOT EXISTS cv_artist_slot_details(slot_id TEXT PRIMARY KEY REFERENCES cv_workshop_slots(id),artist_id TEXT NOT NULL,price REAL NOT NULL,currency TEXT NOT NULL,usd_rate REAL NOT NULL,rate_date TEXT NOT NULL,request_key TEXT NOT NULL UNIQUE,created_by TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1 CHECK(version>=1));
CREATE TRIGGER IF NOT EXISTS cv_artist_slot_overlap_insert BEFORE INSERT ON cv_workshop_slots WHEN NEW.status='active' BEGIN
 SELECT RAISE(ABORT,'CV_SLOT_OVERLAP') WHERE EXISTS(SELECT 1 FROM cv_workshop_slots WHERE artist_id=NEW.artist_id AND status='active' AND start_at<NEW.end_at AND end_at>NEW.start_at);
END;
CREATE TRIGGER IF NOT EXISTS cv_artist_slot_overlap_update BEFORE UPDATE ON cv_workshop_slots WHEN NEW.status='active' BEGIN
 SELECT RAISE(ABORT,'CV_SLOT_OVERLAP') WHERE EXISTS(SELECT 1 FROM cv_workshop_slots WHERE artist_id=NEW.artist_id AND id<>NEW.id AND status='active' AND start_at<NEW.end_at AND end_at>NEW.start_at);
END;
-- Internal ambassador payouts are intentionally separate from the artist ledger.
CREATE TABLE IF NOT EXISTS cv_ambassador_earnings(id TEXT PRIMARY KEY,artist_id TEXT NOT NULL,ambassador_id TEXT NOT NULL REFERENCES cv_staff(id),transaction_id TEXT REFERENCES cv_artist_transactions(id),amount REAL NOT NULL CHECK(amount>=0),currency TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('proposed','approved','paid','cancelled')),note TEXT NOT NULL DEFAULT '',request_key TEXT NOT NULL UNIQUE,created_by TEXT NOT NULL,approved_by TEXT,version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS cv_ambassador_earnings_scope ON cv_ambassador_earnings(ambassador_id,artist_id,status);
