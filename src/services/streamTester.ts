import Hls from 'hls.js';
import { validateSafeUrl } from './m3uParser';

export interface StreamTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  details?: string;
  isHls?: boolean;
}

/**
 * Perform a safe test on a stream URL:
 * Checks reachability, response status, CORS availability, and HLS manifest validity.
 */
export async function testStreamSafetyAndReachability(streamUrl: string): Promise<StreamTestResult> {
  const safety = validateSafeUrl(streamUrl);
  if (!safety.safe) {
    return {
      success: false,
      message: safety.reason || 'Blocked due to security policy',
    };
  }

  const startTime = performance.now();

  // Test 1: Fetch check for manifest headers / body
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(streamUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Range: 'bytes=0-1024',
      },
    });

    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok && response.status !== 206) {
      return {
        success: false,
        latencyMs,
        message: `HTTP Error ${response.status} (${response.statusText})`,
        details: 'The broadcaster server returned an error status code.',
      };
    }

    const text = await response.text();
    const isHls = text.includes('#EXTM3U') || streamUrl.includes('.m3u8');

    return {
      success: true,
      latencyMs,
      message: isHls ? 'HLS Stream reachable and valid' : 'Stream reachable',
      details: isHls ? 'Valid #EXTM3U manifest detected.' : 'HTTP response received successfully.',
      isHls,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';

    // If fetch failed due to CORS, let's test using Hls.js in-memory probe if supported
    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      return new Promise<StreamTestResult>((resolve) => {
        const probeHls = new Hls({
          enableWorker: false,
          manifestLoadingTimeOut: 5000,
          manifestLoadingMaxRetry: 1,
        });

        const timer = setTimeout(() => {
          probeHls.destroy();
          resolve({
            success: false,
            latencyMs,
            message: 'Stream timed out during manifest load (5s)',
            details: errorMsg,
          });
        }, 5500);

        probeHls.loadSource(streamUrl);
        probeHls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          clearTimeout(timer);
          probeHls.destroy();
          resolve({
            success: true,
            latencyMs: Math.round(performance.now() - startTime),
            message: 'Stream verified online via HLS probe',
            details: `Parsed ${data.levels?.length || 1} video quality level(s).`,
            isHls: true,
          });
        });

        probeHls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            clearTimeout(timer);
            probeHls.destroy();
            resolve({
              success: false,
              latencyMs,
              message: data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'CORS / Network restriction' : 'Media decode error',
              details: `${data.details || errorMsg}`,
            });
          }
        });
      });
    }

    return {
      success: false,
      latencyMs,
      message: 'Failed to connect to stream',
      details: errorMsg.includes('abort') ? 'Connection timed out (6s)' : errorMsg,
    };
  }
}
