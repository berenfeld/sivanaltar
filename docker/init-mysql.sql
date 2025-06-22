-- Create the database
CREATE DATABASE IF NOT EXISTS sivanaltar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Drop existing users to avoid conflicts
DROP USER IF EXISTS 'sivanaltar_user'@'localhost';
DROP USER IF EXISTS 'sivanaltar_user'@'%';
DROP USER IF EXISTS 'root'@'localhost';

-- Create user with permissions from any host
CREATE USER 'sivanaltar_user'@'%' IDENTIFIED BY 'sivanaltar_password';
GRANT ALL PRIVILEGES ON sivanaltar_db.* TO 'sivanaltar_user'@'%' WITH GRANT OPTION;

-- Ensure root can connect from any host
CREATE USER 'root'@'%' IDENTIFIED BY 'sivanaltar_root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Update mysql.user table directly to ensure proper configuration
UPDATE mysql.user SET Host='%' WHERE User='sivanaltar_user';
UPDATE mysql.user SET Host='%' WHERE User='root';

FLUSH PRIVILEGES;