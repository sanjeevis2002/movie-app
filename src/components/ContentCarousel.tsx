import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Plus, Check, ShieldCheck } from 'lucide-react';
import { Movie, TVShow, LiveStream } from '../types/ott';

type CarouselItem = Movie | TVShow | LiveStream;

interface ContentCarouselProps {
  title: string;
  subtitle?: string;
  items: CarouselItem[];
  onPlay: (item: CarouselItem) => void;
  onOpenDetails: (item: CarouselItem) => void;
  onToggleWatchlist?: (item: CarouselItem) => void;
  isItemInWatchlist?: (id: string) => boolean;
  onViewAll?: () => void;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  subtitle,
  items,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isItemInWatchlist,
  onViewAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -500 : 500;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-10 select-none">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mr-2 cursor-pointer"
            >
              View All
            </button>
          )}
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Rail */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
      >
        {items.map((item) => {
          const isMovie = 'duration' in item;
          const isShow = 'totalSeasons' in item;
          const isLive = 'streamUrl' in item && !isMovie && !isShow;

          const poster =
            'poster' in item && item.poster
              ? item.poster
              : 'thumbnail' in item
              ? (item as LiveStream).thumbnail
              : '';

          const inWatchlist = isItemInWatchlist ? isItemInWatchlist(item.id) : false;

          return (
            <div
              key={item.id}
              className="group relative flex-none w-[170px] sm:w-[200px] flex flex-col justify-between rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => onOpenDetails(item)}
            >
              {/* Poster Thumbnail */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                <img
                  src={poster}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {'isPremium' in item && item.isPremium && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <ShieldCheck className="w-3 h-3" />
                      VIP
                    </span>
                  )}
                  {isLive && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                {'rating' in item && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-zinc-700/60 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{(item as Movie | TVShow).rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Quick Play Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(item);
                    }}
                    className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    title="Play Now"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>

                  {onToggleWatchlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(item);
                      }}
                      className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 transition-transform hover:scale-110 cursor-pointer"
                      title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {inWatchlist ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 truncate">
                  {'releaseYear' in item && <span>{(item as Movie | TVShow).releaseYear}</span>}
                  {'duration' in item && (
                    <>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span>{(item as Movie).duration}m</span>
                    </>
                  )}
                  {'totalSeasons' in item && (
                    <>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span>{(item as TVShow).totalSeasons} S</span>
                    </>
                  )}
                  {'language' in item && (
                    <>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="truncate">{item.language}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
