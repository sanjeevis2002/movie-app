import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  AlertTriangle,
  Radio,
  Tv,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Minimize,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Channel, PlaybackStatus } from '../types/iptv';

interface VideoPlayerProps {
  channel: Channel;
  onClose?: () => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
  onFavoriteToggle?: (channelId: string) => void;
  isFavorite?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onClose,
  onNextChannel,
  onPrevChannel,
  onFavoriteToggle,
  isFavorite,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<string>('Auto');
  const [availableLevels, setAvailableLevels] = useState<{ id: number; name: string }[]>([]);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'fit' | 'cover'>('fit');
  const [isPipActive, setIsPipActive] = useState<boolean>(false);

  // Auto-hide controls timer
  const triggerControlsVisibility = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Clean up Hls instance and video
  const cleanupPlayer = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying Hls instance', e);
      }
      hlsRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
  }, []);

  // Initialize playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;

    cleanupPlayer();

    setPlaybackStatus('loading');
    setErrorMessage(null);
    setErrorDetails(null);
    setAvailableLevels([]);
    setCurrentLevel('Auto');

    const streamUrl = channel.url.trim();

    // Check native HLS support first (Safari on iOS / macOS, and some smart TV browsers)
    const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
    const isM3u8 = streamUrl.toLowerCase().includes('.m3u8') || streamUrl.toLowerCase().includes('m3u');

    // Setup media event listeners for verified live detection
    const handlePlaying = () => {
      setIsPlaying(true);
      // Mark as verified live only when actual playback commences
      setPlaybackStatus('verified_live');
      setErrorMessage(null);
    };

    const handleWaiting = () => {
      if (playbackStatus === 'verified_live') {
        setPlaybackStatus('buffering');
      }
    };

    const handleTimeUpdate = () => {
      if (video.currentTime > 0 && playbackStatus !== 'verified_live') {
        setPlaybackStatus('verified_live');
      }
    };

    const handleNativeError = () => {
      const err = video.error;
      let msg = 'Live stream encountered an error.';
      if (err) {
        switch (err.code) {
          case 1:
            msg = 'Playback aborted by user.';
            break;
          case 2:
            msg = 'Network connection failed.';
            break;
          case 3:
            msg = 'Decoding error: unsupported media stream format.';
            break;
          case 4:
            msg = 'Stream is offline or restricted by broadcaster (CORS / Geo-block).';
            break;
        }
      }
      setPlaybackStatus('error');
      setErrorMessage(msg);
      setErrorDetails('The broadcaster stream is currently unavailable, offline, or restricted.');
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleNativeError);

    if (Hls.isSupported() && (isM3u8 || !canPlayNative)) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 15000,
        xhrSetup: (xhr) => {
          if (channel.httpReferrer) {
            try {
              xhr.setRequestHeader('Referer', channel.httpReferrer);
            } catch {
              // Browser may restrict setting Referer header directly in XHR
            }
          }
        },
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (data.levels && data.levels.length > 0) {
          const levels = data.levels.map((lvl, index) => ({
            id: index,
            name: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
          }));
          setAvailableLevels(levels);
        }

        // Attempt playback: safe attempt with volume configuration
        video.volume = volume;
        video.muted = isMuted;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setPlaybackStatus('verified_live');
            })
            .catch((e) => {
              // Autoplay with audio was rejected by browser policy: switch to muted and play
              if (e.name === 'NotAllowedError') {
                video.muted = true;
                setIsMuted(true);
                video.play().catch(() => {
                  setPlaybackStatus('idle');
                });
              } else {
                console.warn('Playback start postponed:', e);
              }
            });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setCurrentLevel(lvl.height ? `${lvl.height}p` : 'Auto');
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setPlaybackStatus('offline');
              setErrorMessage('Stream feed offline or blocked by CORS / Geo-restriction');
              setErrorDetails(
                'Public IPTV streams may cycle off-air or require specific broadcaster IP locations. You can retry or switch to another channel.'
              );
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setPlaybackStatus('error');
              setErrorMessage('Media playback error');
              setErrorDetails('Audio/Video decoder error. Attempting automatic recovery...');
              hls.recoverMediaError();
              break;
            default:
              setPlaybackStatus('offline');
              setErrorMessage('Unable to connect to live broadcast');
              setErrorDetails(data.details || 'Stream is currently unreachable.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (canPlayNative) {
      // Native Safari / Apple HLS
      video.src = streamUrl;
      video.volume = volume;
      video.muted = isMuted;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackStatus('verified_live');
        })
        .catch((e) => {
          if (e.name === 'NotAllowedError') {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => setPlaybackStatus('idle'));
          }
        });
    } else {
      setPlaybackStatus('error');
      setErrorMessage('Unsupported stream format');
      setErrorDetails('Your browser does not support HLS stream playback.');
    }

    return () => {
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleNativeError);
      cleanupPlayer();
    };
  }, [channel, retryCount, cleanupPlayer]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Handle Picture in Picture
  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (e) {
      console.warn('PiP not available', e);
    }
  };

  // Quality switch
  const selectQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      if (levelId === -1) {
        setCurrentLevel('Auto');
      } else {
        const selected = availableLevels.find((lvl) => lvl.id === levelId);
        setCurrentLevel(selected?.name || 'Auto');
      }
      setShowQualityMenu(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsVisibility}
      onTouchStart={triggerControlsVisibility}
      className={`relative w-full bg-black select-none overflow-hidden group ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen flex flex-col justify-center' : 'rounded-2xl border border-zinc-800 shadow-2xl aspect-video'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        className={`w-full h-full bg-black ${aspectRatio === 'cover' ? 'object-cover' : 'object-contain'}`}
        onClick={togglePlay}
      />

      {/* Top Bar Overlay */}
      <div
        className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Channel Logo / Fallback */}
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Tv className="w-5 h-5 text-amber-400" />
            )}
          </div>

          {/* Title and Metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-sm sm:text-base truncate drop-shadow">
                {channel.cleanName || channel.name}
              </h2>
              {channel.resolution && (
                <span className="text-[11px] font-mono font-medium text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded bg-amber-400/10 shrink-0">
                  {channel.resolution}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span>{channel.group || 'Tamil Live TV'}</span>
              <span aria-hidden="true" className="text-zinc-500">·</span>
              {playbackStatus === 'verified_live' ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              ) : playbackStatus === 'loading' ? (
                <span className="text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-ping" />
                  Connecting...
                </span>
              ) : (
                <span className="text-zinc-400">Offline / Standby</span>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {onFavoriteToggle && (
            <button
              onClick={() => onFavoriteToggle(channel.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-800/70 text-zinc-300 hover:text-white hover:bg-zinc-700/80'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              ★
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800/70 text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-colors text-sm"
              title="Close player view"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading State Overlay */}
      {playbackStatus === 'loading' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-200">Loading Tamil Live Stream...</p>
          <span className="text-xs text-zinc-400 max-w-xs text-center px-4">
            Establishing HLS video connection with broadcaster feed
          </span>
        </div>
      )}

      {/* Error or Offline Overlay */}
      {(playbackStatus === 'error' || playbackStatus === 'offline') && (
        <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-15">
          <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center mb-3">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
            {errorMessage || 'Stream Currently Unavailable'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-5 leading-relaxed">
            {errorDetails ||
              'This live stream cannot be reached right now. It may be temporarily off-air, blocked by CORS, or geo-restricted.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs sm:text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Stream
            </button>
            {onNextChannel && (
              <button
                onClick={onNextChannel}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                Next Channel
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Direct Stream URL
            </a>
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {playbackStatus === 'buffering' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-700 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-zinc-200">Buffering Live Stream...</span>
        </div>
      )}

      {/* Channel Surfer Buttons (Left & Right overlay) */}
      {showControls && (
        <>
          {onPrevChannel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevChannel();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-zinc-700/60 transition-all opacity-80 hover:opacity-100 z-20 cursor-pointer shadow-lg"
              title="Previous channel"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {onNextChannel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextChannel();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-zinc-700/60 transition-all opacity-80 hover:opacity-100 z-20 cursor-pointer shadow-lg"
              title="Next channel"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </>
      )}

      {/* Bottom Controls Bar Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left Controls: Play, Volume, Live badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer shadow"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg text-zinc-300 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Live Indicator */}
            {playbackStatus === 'verified_live' && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-semibold text-emerald-400 tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          {/* Right Controls: Quality, Reload, Aspect, PiP, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Quality selector */}
            {availableLevels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Quality Settings"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{currentLevel}</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden py-1 z-30">
                    <button
                      onClick={() => selectQuality(-1)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 ${
                        currentLevel === 'Auto' ? 'text-amber-400 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      <span>Auto</span>
                      {currentLevel === 'Auto' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    {availableLevels.map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => selectQuality(lvl.id)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-800 ${
                          currentLevel === lvl.name ? 'text-amber-400 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        <span>{lvl.name}</span>
                        {currentLevel === lvl.name && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reload stream */}
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              title="Reload live stream"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Aspect fit / cover */}
            <button
              onClick={() => setAspectRatio(aspectRatio === 'fit' ? 'cover' : 'fit')}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors hidden sm:block"
              title={aspectRatio === 'fit' ? 'Zoom to fill' : 'Fit to screen'}
            >
              <Minimize className="w-4 h-4" />
            </button>

            {/* Picture in Picture */}
            {'pictureInPictureEnabled' in document && (
              <button
                onClick={togglePip}
                className={`p-2 rounded-lg transition-colors hidden sm:block ${
                  isPipActive ? 'text-amber-400' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
                title="Picture in picture"
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
