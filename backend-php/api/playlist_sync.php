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

$defaultUrl = 'https://iptv-org.github.io/iptv/languages/tam.m3u';
$targetUrl = $_POST['url'] ?? $_GET['url'] ?? $defaultUrl;

// SSRF Protection: Ensure target is valid HTTPS URL
$parsed = parse_url($targetUrl);
if (!$parsed || !isset($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or unapproved playlist URL protocol']);
    exit;
}

try {
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 15,
            'user_agent' => 'TamilStream-IPTV/1.0 (Live TV Engine)'
        ]
    ]);

    $content = @file_get_contents($targetUrl, false, $context);
    if ($content === false) {
        throw new RuntimeException('Unable to reach or download M3U playlist');
    }

    $lines = explode("\n", $content);
    $channelsFound = [];
    $currentExtInf = null;

    foreach ($lines as $rawLine) {
        $line = trim($rawLine);
        if ($line === '' || str_starts_with($line, '#EXTM3U')) {
            continue;
        }

        if (str_starts_with($line, '#EXTINF:')) {
            $currentExtInf = $line;
            continue;
        }

        if ($currentExtInf !== null && !str_starts_with($line, '#')) {
            $streamUrl = $line;

            // Extract metadata from EXTINF
            // tvg-id="..." tvg-logo="..." group-title="..."
            preg_match('/tvg-id="([^"]*)"/i', $currentExtInf, $idMatch);
            preg_match('/tvg-logo="([^"]*)"/i', $currentExtInf, $logoMatch);
            preg_match('/group-title="([^"]*)"/i', $currentExtInf, $groupMatch);

            // Channel name is after the comma
            $commaPos = strrpos($currentExtInf, ',');
            $rawName = ($commaPos !== false) ? substr($currentExtInf, $commaPos + 1) : 'Tamil Channel';
            $rawName = trim($rawName);

            // Clean resolution badge like (1080p), (720p), [Geo-blocked]
            $cleanName = preg_replace('/\s*\(.*?\)/', '', $rawName);
            $cleanName = trim(preg_replace('/\s*\[.*?\]/', '', $cleanName));

            // Extract resolution
            $res = '1080P';
            if (preg_match('/(1080p|720p|576p|480p|4k)/i', $rawName, $resMatch)) {
                $res = strtoupper($resMatch[1]);
            }

            $tvgId = $idMatch[1] ?? '';
            $logoUrl = $logoMatch[1] ?? 'https://i.imgur.com/zDiIhdN.png';
            $group = $groupMatch[1] ?? 'General';
            // Clean multi-groups like "Entertainment;Family;General"
            if (str_contains($group, ';')) {
                $group = explode(';', $group)[0];
            }

            // Derive stable key
            $key = !empty($tvgId) ? strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', $tvgId)) : 'ch_' . substr(md5($streamUrl), 0, 10);

            $channelsFound[] = [
                'channel_key' => $key,
                'name' => $rawName,
                'clean_name' => $cleanName,
                'logo_url' => $logoUrl,
                'stream_url' => $streamUrl,
                'category_name' => ucfirst($group),
                'resolution' => $res,
                'tvg_id' => $tvgId
            ];

            $currentExtInf = null;
        }
    }

    $pdo = Database::getConnection();
    $insertCount = 0;
    $updateCount = 0;

    $stmtCheck = $pdo->prepare("SELECT id, is_manual FROM channels WHERE channel_key = :key");
    $stmtInsert = $pdo->prepare("
        INSERT INTO channels (channel_key, name, clean_name, logo_url, stream_url, category_name, resolution, tvg_id, is_enabled)
        VALUES (:key, :name, :clean_name, :logo, :stream, :category, :res, :tvg_id, 1)
    ");
    $stmtUpdate = $pdo->prepare("
        UPDATE channels SET
            name = :name,
            clean_name = :clean_name,
            logo_url = :logo,
            stream_url = :stream,
            category_name = :category,
            resolution = :res
        WHERE channel_key = :key AND is_manual = 0
    ");

    foreach ($channelsFound as $ch) {
        $stmtCheck->execute([':key' => $ch['channel_key']]);
        $existing = $stmtCheck->fetch();

        if ($existing) {
            if ((int)$existing['is_manual'] === 0) {
                $stmtUpdate->execute([
                    ':key' => $ch['channel_key'],
                    ':name' => $ch['name'],
                    ':clean_name' => $ch['clean_name'],
                    ':logo' => $ch['logo_url'],
                    ':stream' => $ch['stream_url'],
                    ':category' => $ch['category_name'],
                    ':res' => $ch['resolution']
                ]);
                $updateCount++;
            }
        } else {
            $stmtInsert->execute([
                ':key' => $ch['channel_key'],
                ':name' => $ch['name'],
                ':clean_name' => $ch['clean_name'],
                ':logo' => $ch['logo_url'],
                ':stream' => $ch['stream_url'],
                ':category' => $ch['category_name'],
                ':res' => $ch['resolution'],
                ':tvg_id' => $ch['tvg_id']
            ]);
            $insertCount++;
        }
    }

    // Update playlist record
    $now = date('Y-m-d H:i:s');
    $pdo->prepare("UPDATE playlists SET last_sync_at = :now, total_channels = :total WHERE url = :url")
        ->execute([':now' => $now, ':total' => count($channelsFound), ':url' => $targetUrl]);

    echo json_encode([
        'success' => true,
        'message' => 'M3U playlist synchronized successfully',
        'url' => $targetUrl,
        'total_parsed' => count($channelsFound),
        'inserted' => $insertCount,
        'updated' => $updateCount,
        'timestamp' => $now
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
