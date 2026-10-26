<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

try {
    $pdo = Database::getConnection();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES (:key, :val) ON CONFLICT(setting_key) DO UPDATE SET setting_value = :val");
        foreach ($body as $key => $val) {
            $stmt->execute([':key' => $key, ':val' => is_scalar($val) ? (string)$val : json_encode($val)]);
        }
        echo json_encode(['success' => true, 'message' => 'Settings updated']);
    } else {
        $rows = $pdo->query("SELECT setting_key, setting_value FROM app_settings")->fetchAll();
        $settings = [];
        foreach ($rows as $r) {
            $settings[$r['setting_key']] = $r['setting_value'];
        }
        echo json_encode(['success' => true, 'settings' => $settings]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
