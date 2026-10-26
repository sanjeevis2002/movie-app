import React from 'react';
import { Bookmark, Play, Trash2, Film, Tv, Radio } from 'lucide-react';
import { WatchlistItem } from '../types/ott';

interface WatchlistPageProps {
  watchlist: WatchlistItem[];
  onRemoveItem: (contentId: string) => void;
  onPlayItem: (item: WatchlistItem) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  watchlist,
  onRemoveItem,
  onPlayItem,
}) => {
  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bookmark className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">My Watchlist</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Saved movies, TV channels, and live broadcasts to watch anytime across your devices.
          </p>
        </div>

        <span className="text-xs font-semibold text-zinc-400">
          {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
        </span>
      </div>

      {watchlist.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/60 p-6">
          <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Your Watchlist is Empty</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
            Click the bookmark or star icon on any movie, live channel, or broadcast to add it to your personal watchlist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl bg-zinc-900/40 border border-zinc-800 p-2.5 flex flex-col justify-between hover:border-amber-500/60 transition-colors"
            >
              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-950 mb-2">
                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />

                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 uppercase">
                  {item.contentType}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => onPlayItem(item)}
                    className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg cursor-pointer"
                    title="Play"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.contentId)}
                    className="w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 flex items-center justify-center border border-zinc-700 cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
