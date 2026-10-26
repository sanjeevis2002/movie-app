<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $category = $_GET['category'] ?? null;
            $search = $_GET['search'] ?? null;
            $onlyEnabled = !isset($_GET['all']) || $_GET['all'] !== 'true';

            $sql = "SELECT id, channel_key, name, clean_name, logo_url, stream_url, category_name, resolution, is_enabled, is_featured, is_favorite, is_manual FROM channels WHERE 1=1";
            $params = [];

            if ($onlyEnabled) {
                $sql .= " AND is_enabled = 1";
            }
            if ($category && $category !== 'All') {
                $sql .= " AND category_name = :category";
                $params[':category'] = $category;
            }
            if ($search) {
                $sql .= " AND (clean_name LIKE :search OR name LIKE :search)";
                $params[':search'] = '%' . $search . '%';
            }

            $sql .= " ORDER BY is_featured DESC, clean_name ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $channels = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'total' => count($channels),
                'channels' => $channels
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($body['name']) || empty($body['stream_url'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing channel name or stream URL']);
                exit;
            }

            $cleanName = trim((string)$body['name']);
            $key = 'ch_' . substr(md5($cleanName . microtime()), 0, 10);
            $categoryName = $body['category_name'] ?? 'General';
            $resolution = $body['resolution'] ?? '1080P';
            $logoUrl = $body['logo_url'] ?? 'https://i.imgur.com/zDiIhdN.png';
            $streamUrl = trim((string)$body['stream_url']);

            $stmt = $pdo->prepare("
                INSERT INTO channels (channel_key, name, clean_name, logo_url, stream_url, category_name, resolution, is_manual, is_enabled)
                VALUES (:key, :name, :clean_name, :logo, :stream, :category, :res, 1, 1)
            ");
            $stmt->execute([
                ':key' => $key,
                ':name' => $cleanName,
                ':clean_name' => $cleanName,
                ':logo' => $logoUrl,
                ':stream' => $streamUrl,
                ':category' => $categoryName,
                ':res' => $resolution
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Channel created successfully',
                'id' => $pdo->lastInsertId(),
                'channel_key' => $key
            ]);
            break;

        case 'PUT':
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($body['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing channel ID']);
                exit;
            }

            $fields = [];
            $params = [':id' => $body['id']];

            if (isset($body['clean_name'])) {
                $fields[] = 'clean_name = :clean_name';
                $params[':clean_name'] = $body['clean_name'];
            }
            if (isset($body['stream_url'])) {
                $fields[] = 'stream_url = :stream_url';
                $params[':stream_url'] = $body['stream_url'];
            }
            if (isset($body['logo_url'])) {
                $fields[] = 'logo_url = :logo_url';
                $params[':logo_url'] = $body['logo_url'];
            }
            if (isset($body['category_name'])) {
                $fields[] = 'category_name = :category_name';
                $params[':category_name'] = $body['category_name'];
            }
            if (isset($body['is_enabled'])) {
                $fields[] = 'is_enabled = :is_enabled';
                $params[':is_enabled'] = $body['is_enabled'] ? 1 : 0;
            }
            if (isset($body['is_featured'])) {
                $fields[] = 'is_featured = :is_featured';
                $params[':is_featured'] = $body['is_featured'] ? 1 : 0;
            }

            if (empty($fields)) {
                echo json_encode(['success' => true, 'message' => 'No fields to update']);
                exit;
            }

            $sql = "UPDATE channels SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true, 'message' => 'Channel updated']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing channel ID']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM channels WHERE id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Channel deleted']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
            break;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
