import React, { useState } from 'react';
import { Sparkles, Radio, Play, Users, Clock, AlertCircle } from 'lucide-react';
import { LiveStream } from '../types/ott';
import { VideoPlayer } from './VideoPlayer';

interface LiveStreamingPageProps {
  liveStreams: LiveStream[];
  onPlayStream?: (stream: LiveStream) => void;
}

export const LiveStreamingPage: React.FC<LiveStreamingPageProps> = ({ liveStreams }) => {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(
    liveStreams.find((s) => s.status === 'live') || liveStreams[0] || null
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(liveStreams.map((s) => s.category))).filter(Boolean);

  const filteredStreams = liveStreams.filter((s) => {
    const matchesCat = filterCategory === 'all' || s.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesCat && s.isPublished;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Live Broadcasts & Events</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time Tamil broadcasts: 24/7 breaking news, sports leagues, award ceremonies, and live concerts.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterCategory === 'all'
                ? 'bg-rose-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Broadcasts
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterCategory === cat
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Live Video Player */}
      {selectedStream && (
        <div className="space-y-3">
          <div className="w-full bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <VideoPlayer
              channel={{
                id: selectedStream.id,
                name: selectedStream.title,
                cleanName: selectedStream.title,
                url: selectedStream.streamUrl,
                logo: selectedStream.thumbnail,
                group: selectedStream.category,
                enabled: true,
              }}
            />
          </div>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedStream.status === 'live' ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE NOW
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    {selectedStream.status.toUpperCase()}
                  </span>
                )}
                <span className="text-xs text-zinc-400 font-medium">{selectedStream.category}</span>
                {selectedStream.viewsCount && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {selectedStream.viewsCount.toLocaleString()} watching
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">{selectedStream.title}</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {selectedStream.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Streams Cards Grid */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-400" />
          <span>Available Feeds & Upcoming Streams</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStreams.map((st) => {
            const isSelected = selectedStream?.id === st.id;
            return (
              <div
                key={st.id}
                onClick={() => setSelectedStream(st)}
                className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-rose-500/80 shadow-lg ring-1 ring-rose-500/40'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800'
                }`}
              >
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-950 mb-3">
                  <img
                    src={st.thumbnail}
                    alt={st.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />

                  <div className="absolute top-2 left-2">
                    {st.status === 'live' ? (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-zinc-800/90 text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-zinc-700">
                        <Clock className="w-3 h-3" />
                        {st.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-rose-400 uppercase">
                    {st.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5 group-hover:text-rose-300">
                    {st.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {st.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
