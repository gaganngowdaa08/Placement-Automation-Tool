-- Safe migration for existing local PAT databases. Does not delete stored users or profiles.
ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL;

-- Add contact fields when migrating a database created from an earlier version.
SET @has_contact_name = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'contact_name');
SET @sql_contact_name = IF(@has_contact_name = 0, 'ALTER TABLE users ADD COLUMN contact_name VARCHAR(120) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_contact_name FROM @sql_contact_name; EXECUTE stmt_contact_name; DEALLOCATE PREPARE stmt_contact_name;
SET @has_phone_number = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone_number');
SET @sql_phone_number = IF(@has_phone_number = 0, 'ALTER TABLE users ADD COLUMN phone_number VARCHAR(30) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_phone_number FROM @sql_phone_number; EXECUTE stmt_phone_number; DEALLOCATE PREPARE stmt_phone_number;
UPDATE users SET role = 'company' WHERE role = 'employer';

SET @has_resume_name = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'resumes' AND column_name = 'original_file_name');
SET @sql_resume_name = IF(@has_resume_name = 0, 'ALTER TABLE resumes ADD COLUMN original_file_name VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt_resume_name FROM @sql_resume_name; EXECUTE stmt_resume_name; DEALLOCATE PREPARE stmt_resume_name;
CREATE TABLE IF NOT EXISTS college_profiles (
    college_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    college_name VARCHAR(180) NOT NULL,
    college_description TEXT,
    approved_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (college_id),
    UNIQUE KEY user_id (user_id),
    CONSTRAINT college_profiles_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id)
);
