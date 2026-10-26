import React, { useState } from 'react';
import { Search, Film, Radio, Sparkles, X, Play } from 'lucide-react';
import { Movie, LiveStream } from '../types/ott';
import { Channel } from '../types/iptv';

interface SearchPageProps {
  movies: Movie[];
  channels: Channel[];
  liveStreams: LiveStream[];
  onPlayMovie: (m: Movie) => void;
  onPlayChannel: (c: Channel) => void;
  onPlayLiveStream: (l: LiveStream) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  movies,
  channels,
  liveStreams,
  onPlayMovie,
  onPlayChannel,
  onPlayLiveStream,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movies' | 'channels' | 'live'>('all');

  const q = query.trim().toLowerCase();

  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.genre.some((g) => g.toLowerCase().includes(q))
  );

  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.cleanName.toLowerCase().includes(q) ||
      (c.group && c.group.toLowerCase().includes(q))
  );

  const filteredLive = liveStreams.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
  );

  const totalResults =
    filteredMovies.length +
    filteredChannels.length +
    filteredLive.length;

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
          <Search className="w-5 h-5 text-amber-400" />
        </div>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, 130+ TV channels, and live events..."
          className="w-full pl-12 pr-10 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 shadow-xl"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
            filterType === 'all'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          All Results ({totalResults})
        </button>
        <button
          onClick={() => setFilterType('movies')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterType === 'movies'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Movies ({filteredMovies.length})</span>
        </button>
        <button
          onClick={() => setFilterType('channels')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterType === 'channels'
              ? 'bg-amber-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Channels ({filteredChannels.length})</span>
        </button>
        <button
          onClick={() => setFilterType('live')}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterType === 'live'
              ? 'bg-rose-500 text-white font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Streams ({filteredLive.length})</span>
        </button>
      </div>

      {/* Results Rendering */}
      {totalResults === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/60 p-6">
          <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Matches Found</h3>
          <p className="text-xs text-zinc-400">
            {query
              ? `We couldn't find anything matching "${query}". Try searching for title, actor, or genre.`
              : 'Type something in the search bar above to start browsing.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Movies Results */}
          {(filterType === 'all' || filterType === 'movies') && filteredMovies.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Movies ({filteredMovies.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredMovies.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onPlayMovie(m)}
                    className="group relative rounded-xl bg-zinc-900/50 border border-zinc-800 p-2.5 cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-950 mb-2">
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{m.releaseYear} · {m.duration}m</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TV Channels Results */}
          {(filterType === 'all' || filterType === 'channels') && filteredChannels.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Live IPTV Channels ({filteredChannels.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredChannels.slice(0, 18).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onPlayChannel(c)}
                    className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-2.5 cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-zinc-950 p-1 shrink-0 overflow-hidden">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
                      ) : (
                        <Radio className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{c.cleanName || c.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{c.group}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Streams Results */}
          {(filterType === 'all' || filterType === 'live') && filteredLive.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Live Broadcasts ({filteredLive.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {filteredLive.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => onPlayLiveStream(l)}
                    className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 cursor-pointer hover:border-rose-500 transition-colors flex gap-3"
                  >
                    <img src={l.thumbnail} alt={l.title} className="w-20 h-14 rounded object-cover shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-rose-400 uppercase">{l.status}</span>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{l.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{l.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
