-- Idempotent PAT placement approval, student college, and interview tracking migration.
-- Safe to run on both fresh and existing databases; it never deletes user data.

SET @has_college_name = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'students' AND column_name = 'college_name');
SET @sql_college_name = IF(@has_college_name = 0, 'ALTER TABLE students ADD COLUMN college_name VARCHAR(180) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_college_name FROM @sql_college_name; EXECUTE stmt_college_name; DEALLOCATE PREPARE stmt_college_name;

SET @has_requested_college = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'jobs' AND column_name = 'requested_college_name');
SET @sql_requested_college = IF(@has_requested_college = 0, 'ALTER TABLE jobs ADD COLUMN requested_college_name VARCHAR(180) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_requested_college FROM @sql_requested_college; EXECUTE stmt_requested_college; DEALLOCATE PREPARE stmt_requested_college;

SET @has_approval_status = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'jobs' AND column_name = 'college_approval_status');
SET @sql_approval_status = IF(@has_approval_status = 0, 'ALTER TABLE jobs ADD COLUMN college_approval_status VARCHAR(20) NOT NULL DEFAULT ''PENDING''', 'SELECT 1');
PREPARE stmt_approval_status FROM @sql_approval_status; EXECUTE stmt_approval_status; DEALLOCATE PREPARE stmt_approval_status;

SET @has_approval_note = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'jobs' AND column_name = 'college_approval_note');
SET @sql_approval_note = IF(@has_approval_note = 0, 'ALTER TABLE jobs ADD COLUMN college_approval_note VARCHAR(1000) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_approval_note FROM @sql_approval_note; EXECUTE stmt_approval_note; DEALLOCATE PREPARE stmt_approval_note;

SET @has_approved_by = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'jobs' AND column_name = 'approved_by_college_id');
SET @sql_approved_by = IF(@has_approved_by = 0, 'ALTER TABLE jobs ADD COLUMN approved_by_college_id INT DEFAULT NULL', 'SELECT 1');
PREPARE stmt_approved_by FROM @sql_approved_by; EXECUTE stmt_approved_by; DEALLOCATE PREPARE stmt_approved_by;

SET @has_current_round = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'applications' AND column_name = 'current_round');
SET @sql_current_round = IF(@has_current_round = 0, 'ALTER TABLE applications ADD COLUMN current_round INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt_current_round FROM @sql_current_round; EXECUTE stmt_current_round; DEALLOCATE PREPARE stmt_current_round;

SET @has_round_note = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'applications' AND column_name = 'round_note');
SET @sql_round_note = IF(@has_round_note = 0, 'ALTER TABLE applications ADD COLUMN round_note VARCHAR(1000) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_round_note FROM @sql_round_note; EXECUTE stmt_round_note; DEALLOCATE PREPARE stmt_round_note;

-- Existing installations used an ENUM that could not store arbitrary rounds 3–5.
ALTER TABLE applications MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Applied';
