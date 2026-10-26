import React, { useState } from 'react';
import { Play, Star, Tv } from 'lucide-react';
import { Channel } from '../types/iptv';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string, e: React.MouseEvent) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-zinc-900/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
          : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 shadow-sm'
      }`}
    >
      {/* Top row: Logo thumbnail & Favorite button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="relative w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800/80 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
          {channel.logo && !imageError ? (
            <img
              src={channel.logo}
              alt={channel.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 group-hover:text-amber-400 transition-colors">
              <Tv className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[9px] font-bold mt-0.5 text-zinc-400">TV</span>
            </div>
          )}

          {/* Active playing indicator badge */}
          {isActive && (
            <span className="absolute inset-0 bg-amber-500/10 border border-amber-500 rounded-lg pointer-events-none" />
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => onToggleFavorite(channel.id, e)}
            className={`p-1.5 rounded-md transition-colors ${
              isFavorite
                ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Favorited' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Channel info */}
      <div className="min-w-0">
        <h3
          className={`font-semibold text-sm leading-snug truncate transition-colors ${
            isActive ? 'text-amber-400' : 'text-zinc-100 group-hover:text-white'
          }`}
          title={channel.name}
        >
          {channel.cleanName || channel.name}
        </h3>

        {/* Clean unboxed metadata with typographic separators */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 truncate">
          <span className="truncate">{channel.group || 'Tamil'}</span>
          {channel.resolution && (
            <>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-zinc-300 font-mono text-[11px]">{channel.resolution}</span>
            </>
          )}
        </div>
      </div>

      {/* Card bottom: Quick status / Play button */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs">
        {isActive ? (
          <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Playing Now
          </span>
        ) : (
          <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors text-[11px]">
            Live Stream
          </span>
        )}

        <div className="w-6 h-6 rounded-md bg-zinc-800 group-hover:bg-amber-500 text-zinc-300 group-hover:text-zinc-950 flex items-center justify-center transition-colors">
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </div>
      </div>
    </div>
  );
};
