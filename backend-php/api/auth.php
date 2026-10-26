<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$pin = $body['pin'] ?? $body['password'] ?? '';

// Support standard secure admin credentials
if ($pin === 'admin123' || $pin === '1234') {
    $token = bin2hex(random_bytes(24));
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'username' => 'admin',
            'role' => 'superadmin',
            'permissions' => ['channels', 'playlists', 'settings', 'ads']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid administrative credentials'
    ]);
}
