import React, { useState } from 'react';
import { X, Play, Plus, Check, Star, Clock, Calendar, Users, Clapperboard, ShieldCheck } from 'lucide-react';
import { Movie } from '../types/ott';
import { VideoPlayer } from './VideoPlayer';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleWatchlist: (movie: Movie) => void;
  inWatchlist: boolean;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  onToggleWatchlist,
  inWatchlist,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-zinc-700 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player or Backdrop Hero */}
        {isPlaying ? (
          <div className="w-full bg-black">
            <VideoPlayer
              channel={{
                id: movie.id,
                name: movie.title,
                cleanName: movie.title,
                url: movie.videoUrl,
                logo: movie.poster,
                group: 'Movie',
                enabled: true,
              }}
              onClose={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <div className="relative w-full h-64 sm:h-80 md:h-96 shrink-0 bg-zinc-950 overflow-hidden">
            <img
              src={movie.backdrop || movie.thumbnail || movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-transparent" />

            {/* Play Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer"
                title="Play Movie"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Details Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Top Title & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Full Movie
                </span>
                {movie.isPremium && (
                  <span className="text-purple-300 font-bold text-xs uppercase px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    VIP
                  </span>
                )}
                <span className="text-xs text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded">
                  {movie.ageRating}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-2">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {movie.rating.toFixed(1)} / 10
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {movie.duration} Minutes ({Math.floor(movie.duration / 60)}h {movie.duration % 60}m)
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {movie.releaseYear}
                </span>
                <span className="text-zinc-600">·</span>
                <span>{movie.language}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isPlaying ? 'Pause' : 'Play Now'}</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`p-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  inWatchlist
                    ? 'bg-zinc-800 border-amber-500/40 text-amber-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                }`}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span className="hidden sm:inline">{inWatchlist ? 'Added' : 'Watchlist'}</span>
              </button>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {movie.genre.map((g) => (
              <span
                key={g}
                className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300 font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Synopsis</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {movie.description}
            </p>
          </div>

          {/* Cast & Crew */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1">
                <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
                <span>Director</span>
              </div>
              <p className="text-zinc-200 font-medium">{movie.director}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Starring Cast</span>
              </div>
              <p className="text-zinc-200 font-medium">{movie.cast.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
