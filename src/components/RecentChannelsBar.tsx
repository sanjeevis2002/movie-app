import React from 'react';
import { History, Tv, X } from 'lucide-react';
import { Channel } from '../types/iptv';

interface RecentChannelsBarProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onClearRecents: () => void;
  activeChannelId?: string;
}

export const RecentChannelsBar: React.FC<RecentChannelsBarProps> = ({
  channels,
  onSelectChannel,
  onClearRecents,
  activeChannelId,
}) => {
  if (channels.length === 0) return null;

  return (
    <div className="mb-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Recently Watched Channels</span>
        </div>
        <button
          onClick={onClearRecents}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <X className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId;
          return (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left border transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="w-7 h-7 rounded-md bg-zinc-950 border border-zinc-800 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
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
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-medium text-white truncate max-w-[120px]">
                  {channel.cleanName || channel.name}
                </p>
                <p className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                  {channel.group || 'Tamil'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
