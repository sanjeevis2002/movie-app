import React, { useState, useMemo } from 'react';
import { Film, Star, Play, Plus, Check, ShieldCheck, Filter } from 'lucide-react';
import { Movie } from '../types/ott';

interface MoviesPageProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
  onOpenDetails: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  isItemInWatchlist: (id: string) => boolean;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({
  movies,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isItemInWatchlist,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<'all' | 'free' | 'vip'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'title'>('rating');

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genre.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => {
        const matchesGenre = selectedGenre === 'all' || m.genre.includes(selectedGenre);
        const matchesAccess =
          selectedAccess === 'all' ||
          (selectedAccess === 'vip' && m.isPremium) ||
          (selectedAccess === 'free' && !m.isPremium);
        return matchesGenre && matchesAccess && m.status === 'published';
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
        return a.title.localeCompare(b.title);
      });
  }, [movies, selectedGenre, selectedAccess, sortBy]);

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Tamil Movies</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Stream blockbuster Tamil movies, award-winning dramas, and action thrillers in HD.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Access filter */}
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
            <button
              onClick={() => setSelectedAccess('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedAccess === 'all' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Access
            </button>
            <button
              onClick={() => setSelectedAccess('vip')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                selectedAccess === 'vip' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              VIP Only
            </button>
            <button
              onClick={() => setSelectedAccess('free')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedAccess === 'free' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Free
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'newest' | 'title')}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="rating">Top Rated</option>
            <option value="newest">Release Year</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Rails */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedGenre('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            selectedGenre === 'all'
              ? 'bg-amber-500 text-zinc-950 shadow'
              : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
          }`}
        >
          All Genres ({movies.length})
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
              selectedGenre === g
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/60 p-6">
          <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Movies Match this Filter</h3>
          <p className="text-xs text-zinc-400 mb-4">Try choosing another genre or resetting filters.</p>
          <button
            onClick={() => {
              setSelectedGenre('all');
              setSelectedAccess('all');
            }}
            className="px-4 py-2 bg-zinc-800 text-amber-400 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => {
            const inWatchlist = isItemInWatchlist(movie.id);
            return (
              <div
                key={movie.id}
                onClick={() => onOpenDetails(movie)}
                className="group relative flex flex-col justify-between rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {movie.isPremium && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                        <ShieldCheck className="w-3 h-3" />
                        VIP
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-zinc-700/60 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(movie);
                      }}
                      className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Play Movie"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(movie);
                      }}
                      className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-700 transition-transform hover:scale-110 cursor-pointer"
                      title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {inWatchlist ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 truncate">
                    <span>{movie.releaseYear}</span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span>{movie.duration}m</span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="truncate">{movie.genre[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
