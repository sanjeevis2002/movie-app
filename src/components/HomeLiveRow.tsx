import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Radio,
  Eye,
  Tv,
  Sparkles,
} from 'lucide-react';
import { LiveStream } from '../types/ott';

interface HomeLiveRowProps {
  liveStreams: LiveStream[];
  onPlayLiveStream: (stream: LiveStream) => void;
  onViewAll?: () => void;
  title?: string;
  subtitle?: string;
}

export const HomeLiveRow: React.FC<HomeLiveRowProps> = ({
  liveStreams,
  onPlayLiveStream,
  onViewAll,
  title = 'Live',
  subtitle = 'Breaking broadcasts, studio debates, red carpet galas, and concert streams',
}) => {
  const rowScrollRef = useRef<HTMLDivElement>(null);

  // Filter to published & active live streams according to visibility rules
  const visibleStreams = liveStreams.filter(
    (stream) => stream.isPublished !== false && stream.status !== 'disabled'
  );

  // Scroll handler for left/right navigation controls
  const handleScroll = (direction: 'left' | 'right') => {
    if (rowScrollRef.current) {
      const scrollAmount = rowScrollRef.current.clientWidth * 0.75;
      rowScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Optional mouse-wheel horizontal scrolling support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (rowScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      // If user is scrolling vertically while hovered over the horizontal rail,
      // scroll horizontally if the rail hasn't reached the end
      const container = rowScrollRef.current;
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight =
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1;

      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <section
      aria-label="Homepage Live Section"
      className="mb-10 w-full max-w-full overflow-hidden select-none"
    >
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span>{title}</span>
            <span className="text-[10px] font-bold text-rose-400 uppercase px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 tracking-wider">
              Real-Time Feeds
            </span>
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>

        {/* Desktop Navigation & View All link */}
        <div className="flex items-center gap-2 shrink-0">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mr-2 cursor-pointer flex items-center gap-1"
            >
              <span>View All Live</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Scroll live streams left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Scroll live streams right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SINGLE HORIZONTAL ROW (Strictly no wrap, smooth horizontal scroll) */}
      {visibleStreams.length === 0 ? (
        <div className="w-full p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center text-xs text-zinc-400 flex flex-col items-center justify-center">
          <Radio className="w-8 h-8 text-zinc-600 mb-2 stroke-[1.5]" />
          <p className="font-semibold text-zinc-300 text-sm">No Live Broadcasts Right Now</p>
          <p className="text-zinc-500 mt-0.5 max-w-sm">
            All broadcast studios are currently offline. Check back soon for scheduled events or tune in to 130+ TV channels below.
          </p>
        </div>
      ) : (
        <div
          ref={rowScrollRef}
          onWheel={handleWheel}
          tabIndex={0}
          role="region"
          aria-label="Horizontal list of Live Streams"
          className="flex flex-nowrap items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 touch-pan-x focus:outline-none"
        >
          {visibleStreams.map((stream) => {
            const isLive = stream.status === 'live';
            const isScheduled = stream.status === 'scheduled';

            return (
              <div
                key={stream.id}
                onClick={() => onPlayLiveStream(stream)}
                className="group relative flex-none w-[260px] sm:w-[300px] md:w-[320px] lg:w-[340px] flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900 transition-all duration-300 overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:shadow-rose-950/20"
              >
                {/* 16:9 Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Gradient Shadow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badges: LIVE indicator + Category */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    {isLive ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                    ) : isScheduled ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-zinc-950 font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
                        UPCOMING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-300 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
                        OFFLINE
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-semibold text-zinc-300 border border-white/10 uppercase">
                      {stream.category || 'Special'}
                    </span>
                  </div>

                  {/* Top Right: Viewers Count */}
                  {isLive && stream.viewsCount && stream.viewsCount > 0 && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1 border border-rose-500/30 z-10 shadow-sm">
                      <Eye className="w-3 h-3 text-rose-400" />
                      <span>{stream.viewsCount.toLocaleString()} watching</span>
                    </div>
                  )}

                  {/* Hover Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-3.5 flex flex-col justify-between gap-1 flex-1">
                  <div>
                    <h3
                      className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-rose-400 transition-colors"
                      title={stream.title}
                    >
                      {stream.title}
                    </h3>
                    <p
                      className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5"
                      title={stream.description}
                    >
                      {stream.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60 mt-1">
                    <span className="flex items-center gap-1 text-zinc-400 font-medium">
                      <Tv className="w-3 h-3 text-rose-400" />
                      <span>{stream.language || 'Tamil'}</span>
                    </span>

                    {stream.isFeatured && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
