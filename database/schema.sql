-- ===================================================
-- LIVE TAMIL TV — Database Schema (MySQL 8.0+)
-- ===================================================

CREATE DATABASE IF NOT EXISTS `tamil_stream_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tamil_stream_db`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(64) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(128) NOT NULL UNIQUE,
    `role` ENUM('superadmin', 'editor', 'moderator') NOT NULL DEFAULT 'superadmin',
    `last_login` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin Credentials (pin/password: admin123)
-- Hash generated using password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO `admins` (`username`, `password_hash`, `email`, `role`)
VALUES ('admin', '$2y$10$wT8Kz0wQ0p5uYwM5p8Bw7eB6V/d0QjXg9V3oK1V7vW2c6c3m1aB6e', 'admin@tamilstream.local', 'superadmin')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(64) NOT NULL UNIQUE,
    `slug` VARCHAR(64) NOT NULL UNIQUE,
    `icon_url` VARCHAR(255) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `categories` (`name`, `slug`, `display_order`) VALUES
('News', 'news', 1),
('Entertainment', 'entertainment', 2),
('Music', 'music', 3),
('Movies', 'movies', 4),
('Religious', 'religious', 5),
('Sports', 'sports', 6),
('General', 'general', 7)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Playlists Table
CREATE TABLE IF NOT EXISTS `playlists` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(128) NOT NULL,
    `url` TEXT NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `last_sync_at` DATETIME NULL,
    `sync_status` ENUM('idle', 'syncing', 'success', 'failed') NOT NULL DEFAULT 'idle',
    `total_channels` INT NOT NULL DEFAULT 0,
    `error_log` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `playlists` (`name`, `url`, `is_active`) VALUES
('IPTV-ORG Tamil Live TV', 'https://iptv-org.github.io/iptv/languages/tam.m3u', 1)
ON DUPLICATE KEY UPDATE `url` = VALUES(`url`);

-- 4. Channels Table
CREATE TABLE IF NOT EXISTS `channels` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `channel_key` VARCHAR(128) NOT NULL UNIQUE,
    `name` VARCHAR(128) NOT NULL,
    `clean_name` VARCHAR(128) NOT NULL,
    `logo_url` TEXT NULL,
    `stream_url` TEXT NOT NULL,
    `category_id` INT NULL,
    `category_name` VARCHAR(64) NOT NULL DEFAULT 'General',
    `resolution` VARCHAR(32) NOT NULL DEFAULT '1080P',
    `tvg_id` VARCHAR(128) NULL,
    `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
    `is_favorite` TINYINT(1) NOT NULL DEFAULT 0,
    `is_manual` TINYINT(1) NOT NULL DEFAULT 0,
    `sort_order` INT NOT NULL DEFAULT 0,
    `last_stream_check` ENUM('unknown', 'online', 'offline', 'error') NOT NULL DEFAULT 'unknown',
    `last_check_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_enabled_category` (`is_enabled`, `category_id`),
    INDEX `idx_channel_key` (`channel_key`),
    CONSTRAINT `fk_channels_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Stream Health Checks Table
CREATE TABLE IF NOT EXISTS `stream_checks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `channel_id` INT NOT NULL,
    `status` ENUM('online', 'offline', 'timeout', 'error') NOT NULL,
    `http_code` INT NULL,
    `response_time_ms` INT NULL,
    `details` TEXT NULL,
    `checked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_channel_check` (`channel_id`),
    CONSTRAINT `fk_stream_check_channel` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. App Settings Table
CREATE TABLE IF NOT EXISTS `app_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(64) NOT NULL UNIQUE,
    `setting_value` TEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `app_settings` (`setting_key`, `setting_value`) VALUES
('app_name', 'TamilStream IPTV - Live Tamil TV Channels'),
('theme_mode', 'dark'),
('maintenance_mode', 'false'),
('default_playlist_url', 'https://iptv-org.github.io/iptv/languages/tam.m3u'),
('auto_refresh_playlist', 'true'),
('cache_duration_hours', '6'),
('stream_timeout_seconds', '8')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- 7. Advertisement Settings Table
CREATE TABLE IF NOT EXISTS `ad_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `banner_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    `interstitial_enabled` TINYINT(1) NOT NULL DEFAULT 0,
    `banner_ad_unit_id` VARCHAR(128) NULL DEFAULT '',
    `interstitial_ad_unit_id` VARCHAR(128) NULL DEFAULT '',
    `interstitial_interval_clicks` INT NOT NULL DEFAULT 5,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ad_settings` (`banner_enabled`, `interstitial_enabled`) VALUES (0, 0);

-- 8. User Favorites & History (for future device/account sync)
CREATE TABLE IF NOT EXISTS `favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_identifier` VARCHAR(128) NOT NULL,
    `channel_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_fav` (`user_identifier`, `channel_id`),
    CONSTRAINT `fk_fav_channel` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `watch_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_identifier` VARCHAR(128) NOT NULL,
    `channel_id` INT NOT NULL,
    `duration_seconds` INT NOT NULL DEFAULT 0,
    `watched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_history` (`user_identifier`),
    CONSTRAINT `fk_hist_channel` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Admin Activity Logs
CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT NULL,
    `action` VARCHAR(64) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` VARCHAR(64) NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
