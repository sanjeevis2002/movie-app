import React from 'react';
import { History, Play, Trash2, Clock } from 'lucide-react';
import { WatchHistoryItem } from '../types/ott';

interface WatchHistoryPageProps {
  history: WatchHistoryItem[];
  onClearHistory: () => void;
  onResumeItem: (item: WatchHistoryItem) => void;
}

export const WatchHistoryPage: React.FC<WatchHistoryPageProps> = ({
  history,
  onClearHistory,
  onResumeItem,
}) => {
  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Watch History & Progress</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Resume your movies, series, and live streaming sessions right where you left off.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/60 p-6">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Watch History Yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
            Start streaming any Tamil blockbuster movie, TV series, or live TV channel to track your watch progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => {
            const progressPercent = Math.min(
              100,
              Math.round((item.progressSeconds / Math.max(1, item.durationSeconds)) * 100)
            );
            return (
              <div
                key={item.id}
                onClick={() => onResumeItem(item)}
                className="group relative rounded-xl bg-zinc-900/40 border border-zinc-800 p-3 flex flex-col justify-between hover:border-amber-500/60 transition-colors cursor-pointer"
              >
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-950 mb-3">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />

                  {/* Progress bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-800">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${Math.max(15, progressPercent)}%` }}
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                    <span className="uppercase font-semibold text-amber-400">{item.contentType}</span>
                    <span>{new Date(item.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>Watched {Math.round(item.progressSeconds / 60)}m of {Math.round(item.durationSeconds / 60)}m</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
