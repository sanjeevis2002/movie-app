<?php
declare(strict_types=1);

session_start();

$isAuthenticated = isset($_SESSION['tamil_admin_logged']) && $_SESSION['tamil_admin_logged'] === true;

// Handle login POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $pin = trim($_POST['password'] ?? '');
    if ($pin === 'admin123' || $pin === '1234') {
        $_SESSION['tamil_admin_logged'] = true;
        $_SESSION['admin_user'] = 'SuperAdmin';
        header('Location: index.php');
        exit;
    } else {
        $loginError = 'Invalid credentials. Please enter authorized PIN.';
    }
}

// Handle logout GET
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    header('Location: index.php');
    exit;
}

require_once __DIR__ . '/../config/db.php';
$pdo = Database::getConnection();

// Fetch metrics
$totalChannels = (int)$pdo->query("SELECT COUNT(*) FROM channels")->fetchColumn();
$activeChannels = (int)$pdo->query("SELECT COUNT(*) FROM channels WHERE is_enabled = 1")->fetchColumn();
$categoriesCount = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
$lastSync = $pdo->query("SELECT last_sync_at FROM playlists LIMIT 1")->fetchColumn() ?: 'Never';
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TamilStream IPTV — Administration Control Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #09090b; color: #f4f4f5; min-height: 100vh; }
    .gold { color: #f59e0b; }
    .bg-surface { background-color: #18181b; border: 1px solid #27272a; }
    .btn { padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 13px; transition: all 0.2s; }
    .btn-gold { background-color: #f59e0b; color: #09090b; }
    .btn-gold:hover { background-color: #d97706; }
    .btn-outline { background: transparent; border: 1px solid #3f3f46; color: #f4f4f5; }
    .btn-outline:hover { background: #27272a; }
    .btn-danger { background-color: #ef4444; color: white; }
    input, select, textarea { width: 100%; padding: 10px 14px; background: #18181b; border: 1px solid #3f3f46; color: #f4f4f5; border-radius: 8px; font-size: 14px; outline: none; }
    input:focus, select:focus { border-color: #f59e0b; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-live { background: rgba(239,68,68,0.2); color: #ef4444; }
    .badge-gold { background: rgba(245,158,11,0.2); color: #f59e0b; }
    .card { padding: 20px; border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { text-align: left; padding: 12px; border-bottom: 1px solid #27272a; color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px; border-bottom: 1px solid #27272a; font-size: 13px; vertical-align: middle; }
    tr:hover td { background-color: rgba(255,255,255,0.02); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: none; align-items: center; justify-content: center; z-index: 100; }
    .modal-box { background: #18181b; border: 1px solid #3f3f46; width: 90%; max-width: 550px; border-radius: 14px; padding: 24px; max-height: 90vh; overflow-y: auto; }
  </style>
</head>
<body>

<?php if (!$isAuthenticated): ?>
  <!-- Login Screen -->
  <div style="display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 20px;">
    <div class="bg-surface card" style="width: 100%; max-width: 420px; text-align: center;">
      <div style="display: inline-flex; width: 56px; height: 56px; background: #f59e0b; border-radius: 12px; align-items: center; justify-content: center; margin-bottom: 16px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2.5"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
      </div>
      <h2 style="font-weight: 800; font-size: 22px;">TamilStream <span class="gold">Portal</span></h2>
      <p style="color: #a1a1aa; font-size: 13px; margin: 8px 0 24px;">Administrative control center for Live Tamil IPTV streams.</p>

      <?php if (!empty($loginError)): ?>
        <div style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 16px;">
          <?= htmlspecialchars($loginError) ?>
        </div>
      <?php endif; ?>

      <form method="POST" action="index.php" style="text-align: left;">
        <input type="hidden" name="action" value="login">
        <label style="font-size: 12px; color: #a1a1aa; font-weight: 600; display: block; margin-bottom: 6px;">ADMIN PIN / PASSWORD</label>
        <input type="password" name="password" placeholder="Enter PIN (e.g. 1234 or admin123)" required autofocus style="margin-bottom: 16px;">
        <button type="submit" class="btn btn-gold" style="width: 100%; padding: 12px; font-size: 14px;">Authorize & Enter Portal</button>
      </form>
    </div>
  </div>
<?php else: ?>
  <!-- Authenticated Admin Dashboard -->
  <div style="display: flex; min-height: 100vh;">
    <!-- Sidebar -->
    <aside style="width: 260px; background: #121215; border-right: 1px solid #27272a; padding: 24px 16px; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
        <div style="width: 38px; height: 38px; background: #f59e0b; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2.5"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        </div>
        <div>
          <div style="font-weight: 800; font-size: 16px; letter-spacing: 0.5px;">TAMIL<span class="gold">STREAM</span></div>
          <div style="font-size: 10px; color: #a1a1aa; letter-spacing: 1px;">IPTV CONTROL HUB</div>
        </div>
      </div>

      <nav style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
        <button onclick="showTab('dashboard')" class="btn btn-outline" style="text-align: left; display: flex; align-items: center; gap: 10px;">📊 Dashboard</button>
        <button onclick="showTab('channels')" class="btn btn-outline" style="text-align: left; display: flex; align-items: center; gap: 10px;">📺 Channels Management</button>
        <button onclick="showTab('playlist')" class="btn btn-outline" style="text-align: left; display: flex; align-items: center; gap: 10px;">🔄 M3U Playlist Sync</button>
        <button onclick="showTab('settings')" class="btn btn-outline" style="text-align: left; display: flex; align-items: center; gap: 10px;">⚙️ System Settings</button>
      </nav>

      <a href="index.php?action=logout" class="btn btn-danger" style="text-align: center; text-decoration: none;">Exit Admin Session</a>
    </aside>

    <!-- Main Content Area -->
    <main style="flex: 1; padding: 32px; overflow-y: auto;">
      <!-- Dashboard View -->
      <section id="tab-dashboard">
        <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 24px;">System Overview</h1>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
          <div class="bg-surface card">
            <div style="font-size: 12px; color: #a1a1aa;">TOTAL CHANNELS</div>
            <div style="font-size: 32px; font-weight: 800; color: #f59e0b; margin-top: 4px;"><?= $totalChannels ?></div>
            <div style="font-size: 11px; color: #10b981; margin-top: 4px;">Synchronized in Registry</div>
          </div>
          <div class="bg-surface card">
            <div style="font-size: 12px; color: #a1a1aa;">ACTIVE STREAMS</div>
            <div style="font-size: 32px; font-weight: 800; color: #f4f4f5; margin-top: 4px;"><?= $activeChannels ?></div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">Online for Client Apps</div>
          </div>
          <div class="bg-surface card">
            <div style="font-size: 12px; color: #a1a1aa;">CATEGORIES</div>
            <div style="font-size: 32px; font-weight: 800; color: #f4f4f5; margin-top: 4px;"><?= $categoriesCount ?></div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">News, Entertainment, etc.</div>
          </div>
          <div class="bg-surface card">
            <div style="font-size: 12px; color: #a1a1aa;">LAST M3U SYNC</div>
            <div style="font-size: 16px; font-weight: 700; color: #f59e0b; margin-top: 10px;"><?= htmlspecialchars((string)$lastSync) ?></div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 4px;">iptv-org Source Feed</div>
          </div>
        </div>

        <div class="bg-surface card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 18px; font-weight: 700;">Live Stream Status Diagnostics</h2>
            <button onclick="syncPlaylistDirect()" class="btn btn-gold">Sync Latest M3U Streams</button>
          </div>
          <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6;">
            TamilStream IPTV synchronizes directly with the official community-maintained M3U dataset at
            <code style="color: #f59e0b; background: rgba(245,158,11,0.1); padding: 2px 6px; border-radius: 4px;">https://iptv-org.github.io/iptv/languages/tam.m3u</code>.
            All client Android applications receive continuous HLS updates through the REST API.
          </p>
        </div>
      </section>

      <!-- Channels Tab -->
      <section id="tab-channels" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 26px; font-weight: 800;">Channels Management</h1>
            <p style="color: #a1a1aa; font-size: 13px;">Manage, edit, disable or preview IPTV channels.</p>
          </div>
          <button onclick="openChannelModal()" class="btn btn-gold">+ Add Custom Channel</button>
        </div>

        <div class="bg-surface card">
          <input type="text" id="channelSearch" placeholder="Search channels by title or category..." onkeyup="filterChannels()" style="margin-bottom: 16px;">
          <table id="channelsTable">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Category</th>
                <th>Resolution</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php
              $channels = $pdo->query("SELECT * FROM channels ORDER BY clean_name ASC LIMIT 50")->fetchAll();
              foreach ($channels as $ch):
              ?>
                <tr id="row-<?= $ch['id'] ?>">
                  <td>
                    <img src="<?= htmlspecialchars((string)$ch['logo_url']) ?>" onerror="this.src='https://i.imgur.com/zDiIhdN.png'" style="width: 36px; height: 36px; object-fit: contain; border-radius: 6px; background: #000; padding: 2px;">
                  </td>
                  <td><strong><?= htmlspecialchars((string)$ch['clean_name']) ?></strong></td>
                  <td><span class="badge badge-gold"><?= htmlspecialchars((string)$ch['category_name']) ?></span></td>
                  <td><?= htmlspecialchars((string)$ch['resolution']) ?></td>
                  <td>
                    <span class="badge <?= $ch['is_enabled'] ? 'badge-gold' : 'badge-live' ?>">
                      <?= $ch['is_enabled'] ? 'Enabled' : 'Disabled' ?>
                    </span>
                  </td>
                  <td>
                    <button onclick="testStream('<?= htmlspecialchars((string)$ch['stream_url']) ?>')" class="btn btn-outline" style="padding: 4px 10px;">Test</button>
                    <button onclick="deleteChannel(<?= $ch['id'] ?>)" class="btn btn-danger" style="padding: 4px 10px;">Delete</button>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </section>

      <!-- M3U Playlist Sync Tab -->
      <section id="tab-playlist" style="display: none;">
        <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 8px;">M3U Playlist Synchronization</h1>
        <p style="color: #a1a1aa; font-size: 13px; margin-bottom: 24px;">Configure source M3U URL and trigger on-demand sync.</p>

        <div class="bg-surface card" style="max-width: 650px;">
          <label style="font-size: 13px; color: #a1a1aa; font-weight: 600; display: block; margin-bottom: 8px;">M3U SOURCE URL</label>
          <input type="text" id="m3uUrl" value="https://iptv-org.github.io/iptv/languages/tam.m3u" style="margin-bottom: 16px;">

          <button onclick="syncPlaylistDirect()" id="syncBtn" class="btn btn-gold" style="width: 100%; padding: 12px;">Trigger Immediate Sync</button>
          <div id="syncResult" style="margin-top: 16px; font-size: 13px;"></div>
        </div>
      </section>

      <!-- Settings Tab -->
      <section id="tab-settings" style="display: none;">
        <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 24px;">Application Settings</h1>
        <div class="bg-surface card" style="max-width: 650px;">
          <div style="margin-bottom: 16px;">
            <label style="font-size: 13px; color: #a1a1aa; font-weight: 600; display: block; margin-bottom: 6px;">APPLICATION TITLE</label>
            <input type="text" value="TamilStream IPTV - Live Tamil TV Channels">
          </div>
          <div style="margin-bottom: 16px;">
            <label style="font-size: 13px; color: #a1a1aa; font-weight: 600; display: block; margin-bottom: 6px;">STREAM TIMEOUT (SECONDS)</label>
            <input type="number" value="8">
          </div>
          <button class="btn btn-gold" onclick="alert('Settings saved successfully')">Save Configurations</button>
        </div>
      </section>
    </main>
  </div>

  <script>
    function showTab(tabName) {
      document.querySelectorAll('main > section').forEach(sec => sec.style.display = 'none');
      const target = document.getElementById('tab-' + tabName);
      if (target) target.style.display = 'block';
    }

    async function syncPlaylistDirect() {
      const url = document.getElementById('m3uUrl')?.value || 'https://iptv-org.github.io/iptv/languages/tam.m3u';
      const resultBox = document.getElementById('syncResult');
      if (resultBox) resultBox.innerHTML = '<span style="color: #f59e0b;">Fetching and parsing M3U entries...</span>';

      try {
        const resp = await fetch('../api/playlist_sync.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'url=' + encodeURIComponent(url)
        });
        const data = await resp.json();
        if (data.success) {
          alert('Success: ' + data.total_parsed + ' Tamil channels synchronized!');
          window.location.reload();
        } else {
          alert('Sync Error: ' + data.error);
        }
      } catch (e) {
        alert('Network error connecting to API: ' + e.message);
      }
    }

    async function testStream(url) {
      try {
        const resp = await fetch('../api/stream_check.php?url=' + encodeURIComponent(url));
        const data = await resp.json();
        alert('Stream Check Result:\n' + data.status_label + '\nLatency: ' + data.latency_ms + 'ms');
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }

    async function deleteChannel(id) {
      if (!confirm('Are you sure you want to remove this channel?')) return;
      try {
        const resp = await fetch('../api/channels.php?id=' + id, { method: 'DELETE' });
        const data = await resp.json();
        if (data.success) {
          document.getElementById('row-' + id)?.remove();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }

    function filterChannels() {
      const query = document.getElementById('channelSearch').value.toLowerCase();
      document.querySelectorAll('#channelsTable tbody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
      });
    }
  </script>
<?php endif; ?>

</body>
</html>
