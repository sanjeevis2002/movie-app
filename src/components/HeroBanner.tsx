import React, { useState } from 'react';
import { Play, Plus, Check, Info, Star, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { Movie } from '../types/ott';

interface HeroBannerProps {
  featuredItems: Movie[];
  onPlay: (item: Movie) => void;
  onOpenDetails: (item: Movie) => void;
  onToggleWatchlist: (item: Movie) => void;
  isItemInWatchlist: (id: string) => boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredItems,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isItemInWatchlist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!featuredItems || featuredItems.length === 0) return null;

  const current = featuredItems[currentIndex] || featuredItems[0];
  const inWatchlist = isItemInWatchlist(current.id);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const backdropImage = current.backdrop || current.poster;

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800/60 shadow-2xl bg-zinc-950 mb-8 select-none">
      {/* Background Image with Dark Vignette Gradients */}
      <div className="absolute inset-0">
        <img
          src={backdropImage}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-90 transform transition-transform duration-700 ease-out scale-100"
        />
        {/* Gradients: dark from left, bottom, and top */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/60" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative h-full w-full px-6 sm:px-10 lg:px-12 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold uppercase tracking-wider text-[11px]">
              FEATURED MOVIE
            </span>

            {current.isPremium && (
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                VIP EXCLUSIVE
              </span>
            )}

            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {current.rating.toFixed(1)}
              </span>
              <span className="text-zinc-600">·</span>
              <span>{current.releaseYear}</span>
              <span className="text-zinc-600">·</span>
              <span>{current.duration}m</span>
              <span className="text-zinc-600">·</span>
              <span>{current.language}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {current.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
            {current.genre.map((g, idx) => (
              <span key={g} className="flex items-center gap-2">
                <span className="text-zinc-300 font-medium">{g}</span>
                {idx < current.genre.length - 1 && <span className="text-zinc-600">·</span>}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed drop-shadow">
            {current.description}
          </p>

          {/* Action CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(current)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(current)}
              className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                inWatchlist
                  ? 'bg-zinc-800 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
              <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
            </button>

            <button
              onClick={() => onOpenDetails(current)}
              className="px-4 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Controls (Previous & Next) */}
      {featuredItems.length > 1 && (
        <div className="absolute right-6 bottom-6 flex items-center gap-2 z-20">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700/80 backdrop-blur-xs transition-colors cursor-pointer shadow-md"
            title="Previous Featured"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {featuredItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === i ? 'w-6 bg-amber-400' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700/80 backdrop-blur-xs transition-colors cursor-pointer shadow-md"
            title="Next Featured"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
