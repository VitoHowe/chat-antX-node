-- Database migration script for users table
-- Add plain_password and is_active fields

-- Add plain_password field (WARNING: Very insecure)
ALTER TABLE users ADD COLUMN plain_password VARCHAR(255) DEFAULT '' COMMENT 'Plain text password for admin use only';

-- Add user status field
ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1 COMMENT 'User status: 1-active, 0-deactivated';

-- Update existing users to active status
UPDATE users SET is_active = 1 WHERE is_active IS NULL;

-- Note: Existing users will have empty plain_password field
-- This is normal since we cannot reverse encrypted passwords
-- Only newly registered users will have plain_password records 