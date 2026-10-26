import { Channel, ImportLog } from '../types/iptv';

export const DEFAULT_TAMIL_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/languages/tam.m3u';

/**
 * Validate that a URL is safe to fetch from the client or server (prevent SSRF)
 */
export function validateSafeUrl(urlStr: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTP and HTTPS URLs are permitted.' };
    }

    const host = parsed.hostname.toLowerCase();

    // Check for loopback, localhost, and internal address ranges
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return { safe: false, reason: 'Access to loopback/local domain names is blocked for security.' };
    }

    // Check private IPv4 patterns
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = host.match(ipv4Pattern);
    if (ipMatch) {
      const b1 = parseInt(ipMatch[1], 10);
      const b2 = parseInt(ipMatch[2], 10);
      if (
        b1 === 10 || // 10.0.0.0/8
        b1 === 127 || // 127.0.0.0/8
        (b1 === 172 && b2 >= 16 && b2 <= 31) || // 172.16.0.0/12
        (b1 === 192 && b2 === 168) || // 192.168.0.0/16
        (b1 === 169 && b2 === 254) // link-local
      ) {
        return { safe: false, reason: 'Access to private internal IP addresses is prohibited.' };
      }
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL format.' };
  }
}

/**
 * Clean resolution tag from name and return clean name + resolution string
 */
export function extractResolutionAndName(rawName: string): { cleanName: string; resolution?: string } {
  const trimmed = rawName.trim();
  const resMatch = trimmed.match(/\((1080p|720p|576p|480p|360p|240p|4K|UHD|HD|SD)\)/i);
  if (resMatch) {
    const resolution = resMatch[1].toUpperCase();
    const cleanName = trimmed.replace(resMatch[0], '').trim();
    return { cleanName: cleanName || trimmed, resolution };
  }
  // Check standalone HD or SD at end
  if (/\bHD\b/i.test(trimmed)) {
    return { cleanName: trimmed.replace(/\bHD\b/i, '').trim(), resolution: 'HD' };
  }
  return { cleanName: trimmed };
}

/**
 * Generate a deterministic ID for a channel based on tvgId or name + url
 */
function generateChannelId(tvgId: string | undefined, name: string, url: string): string {
  if (tvgId && tvgId.trim()) {
    return tvgId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
  const base = `${name}_${url}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return base.slice(0, 48);
}

/**
 * Parse raw M3U / M3U8 string content into an array of Channel objects
 */
export function parseM3U(m3uContent: string): { channels: Channel[]; log: ImportLog } {
  const lines = m3uContent.split(/\r?\n/);
  const channels: Channel[] = [];
  const errors: string[] = [];
  const seenUrls = new Set<string>();

  let currentExtInf: {
    tvgId?: string;
    logo?: string;
    group?: string;
    rawName?: string;
    httpReferrer?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTM3U')) {
      continue;
    }

    if (line.startsWith('#EXTVLCOPT:')) {
      // e.g. #EXTVLCOPT:http-referrer=https://rtm-player.glueapi.io/
      if (currentExtInf) {
        const refMatch = line.match(/http-referrer=(.*)/i);
        if (refMatch) {
          currentExtInf.httpReferrer = refMatch[1].trim();
        }
      }
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      // Extract tvg attributes: tvg-id="...", tvg-logo="...", group-title="..."
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const httpRefMatch = line.match(/http-referrer="([^"]*)"/i);

      // Name is everything after the last comma on the EXTINF line
      const commaIndex = line.lastIndexOf(',');
      let rawName = 'Tamil Live TV';
      if (commaIndex !== -1) {
        rawName = line.substring(commaIndex + 1).trim() || 'Tamil Live TV';
      }

      // Group normalization: if group contains semicolons (e.g. "Entertainment;Family;General"), take the primary one
      let group = 'Tamil';
      if (groupMatch && groupMatch[1].trim()) {
        const primaryGroup = groupMatch[1].split(';')[0].trim();
        if (primaryGroup) {
          group = primaryGroup;
        }
      }

      currentExtInf = {
        tvgId: tvgIdMatch ? tvgIdMatch[1].trim() : undefined,
        logo: tvgLogoMatch ? tvgLogoMatch[1].trim() : '',
        group: group || 'General',
        rawName,
        httpReferrer: httpRefMatch ? httpRefMatch[1].trim() : undefined,
      };
      continue;
    }

    // If it's a URL and we had an EXTINF line preceding it
    if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentExtInf) {
        const streamUrl = line.trim();

        // Check for duplicates
        if (seenUrls.has(streamUrl)) {
          // Skip duplicate stream URL
          currentExtInf = null;
          continue;
        }
        seenUrls.add(streamUrl);

        const { cleanName, resolution } = extractResolutionAndName(currentExtInf.rawName || 'Tamil TV');
        const channelId = generateChannelId(currentExtInf.tvgId, cleanName, streamUrl);

        channels.push({
          id: channelId,
          name: currentExtInf.rawName || 'Tamil TV',
          cleanName,
          resolution,
          logo: currentExtInf.logo || '',
          group: currentExtInf.group || 'Tamil',
          url: streamUrl,
          tvgId: currentExtInf.tvgId,
          httpReferrer: currentExtInf.httpReferrer,
          enabled: true,
          isFavorite: false,
          isFeatured: false,
        });

        currentExtInf = null;
      }
    } else if (line.startsWith('#')) {
      // Other metadata or comment line, ignore
      continue;
    } else {
      // Possible orphan line
      if (currentExtInf) {
        errors.push(`Invalid stream URL format on line ${i + 1}: ${line.slice(0, 50)}`);
        currentExtInf = null;
      }
    }
  }

  const log: ImportLog = {
    timestamp: Date.now(),
    url: '',
    totalParsed: lines.length,
    validChannels: channels.length,
    errors: errors.slice(0, 10),
  };

  return { channels, log };
}

/**
 * Fetch and parse playlist from a URL with safety checks and timeout
 */
export async function fetchAndParsePlaylist(url: string): Promise<{ channels: Channel[]; log: ImportLog }> {
  const safety = validateSafeUrl(url);
  if (!safety.safe) {
    throw new Error(safety.reason || 'Invalid or forbidden URL.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'audio/x-mpegurl, application/x-mpegurl, text/plain, */*',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Playlist server responded with HTTP status ${response.status} (${response.statusText})`);
    }

    const text = await response.text();
    if (!text || (!text.includes('#EXTM3U') && !text.includes('#EXTINF'))) {
      throw new Error('Downloaded file does not appear to be a valid M3U playlist format.');
    }

    const result = parseM3U(text);
    result.log.url = url;
    return result;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'Unknown network error fetching playlist';
    throw new Error(message);
  }
}
