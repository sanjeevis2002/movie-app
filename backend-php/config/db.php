<?php
declare(strict_types=1);

/**
 * LIVE TAMIL TV — Database Connection Handler
 * Supports MySQL via PDO with configurable environment parameters.
 */

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_DATABASE') ?: 'tamil_stream_db';
        $username = getenv('DB_USERNAME') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';

        try {
            if (extension_loaded('pdo_mysql') && defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ];
                self::$instance = new PDO($dsn, $username, $password, $options);
            } else {
                throw new PDOException('pdo_mysql not loaded, using SQLite fallback');
            }
        } catch (PDOException $e) {
            // Portable Fallback for local sandbox testing without running MySQL daemon
            $sqlitePath = __DIR__ . '/tamil_stream.sqlite';
            $dsn = "sqlite:{$sqlitePath}";
            self::$instance = new PDO($dsn, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            self::initSqliteTables(self::$instance);
        }

        return self::$instance;
    }

    private static function initSqliteTables(PDO $pdo): void {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                slug TEXT NOT NULL UNIQUE,
                icon_url TEXT,
                display_order INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_key TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                clean_name TEXT NOT NULL,
                logo_url TEXT,
                stream_url TEXT NOT NULL,
                category_id INTEGER,
                category_name TEXT DEFAULT 'General',
                resolution TEXT DEFAULT '1080P',
                tvg_id TEXT,
                is_enabled INTEGER DEFAULT 1,
                is_featured INTEGER DEFAULT 0,
                is_favorite INTEGER DEFAULT 0,
                is_manual INTEGER DEFAULT 0,
                last_stream_check TEXT DEFAULT 'unknown',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                last_sync_at DATETIME,
                total_channels INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS app_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                setting_key TEXT NOT NULL UNIQUE,
                setting_value TEXT
            );
        ");

        // Seed basic categories if empty
        $count = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
        if ($count === 0) {
            $pdo->exec("
                INSERT INTO categories (name, slug, display_order) VALUES
                ('News', 'news', 1),
                ('Entertainment', 'entertainment', 2),
                ('Music', 'music', 3),
                ('Movies', 'movies', 4),
                ('Religious', 'religious', 5),
                ('Sports', 'sports', 6),
                ('General', 'general', 7);
                INSERT INTO playlists (name, url, is_active) VALUES
                ('IPTV-ORG Tamil Live TV', 'https://iptv-org.github.io/iptv/languages/tam.m3u', 1);
            ");
        }
    }
}
