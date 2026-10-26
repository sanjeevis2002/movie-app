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

$streamUrl = $_POST['url'] ?? $_GET['url'] ?? '';
if (empty($streamUrl)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing stream URL']);
    exit;
}

// SSRF Protection
$parsed = parse_url($streamUrl);
if (!$parsed || !isset($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid stream protocol']);
    exit;
}

$startTime = microtime(true);
$ch = curl_init($streamUrl);
curl_setopt_array($ch, [
    CURLOPT_NOBODY => true,
    CURLOPT_TIMEOUT => 6,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Android; Mobile) TamilStream/1.0 ExoPlayer/2.19'
]);

$success = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$durationMs = (int)((microtime(true) - $startTime) * 1000);
curl_close($ch);

$isOnline = ($httpCode >= 200 && $httpCode < 400);

echo json_encode([
    'success' => true,
    'stream_url' => $streamUrl,
    'is_online' => $isOnline,
    'http_code' => $httpCode,
    'latency_ms' => $durationMs,
    'status_label' => $isOnline ? 'Active / Reachable' : ($httpCode > 0 ? "HTTP {$httpCode} Error" : ($curlError ?: 'Connection Timeout'))
]);
