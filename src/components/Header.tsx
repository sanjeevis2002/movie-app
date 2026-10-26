import React from 'react';
import {
  Tv,
  Search,
  RotateCcw,
  Star,
  History,
  Settings,
  X,
  Radio,
} from 'lucide-react';

export type NavTab = 'all' | 'favorites' | 'recent' | 'admin';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefreshPlaylist: () => void;
  isRefreshing: boolean;
  totalChannels: number;
  favoritesCount: number;
  recentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onRefreshPlaylist,
  isRefreshing,
  totalChannels,
  favoritesCount,
  recentsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('all')}
            className="flex items-center gap-3 cursor-pointer shrink-0 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
              <Tv className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  TamilStream
                </span>
                <span className="text-amber-400 font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">தமிழ் நேரடி தொலைக்காட்சி</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Tamil channels (e.g. Sun, News, Music)..."
                className="w-full pl-9 pr-9 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="hidden lg:flex items-center gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl">
              <button
                onClick={() => onTabChange('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>All Live TV</span>
                <span className="text-[10px] text-zinc-500 ml-0.5">({totalChannels})</span>
              </button>

              <button
                onClick={() => onTabChange('favorites')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'favorites'
                    ? 'bg-zinc-800 text-amber-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Favorites</span>
                {favoritesCount > 0 && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('recent')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'recent'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Recents</span>
                {recentsCount > 0 && (
                  <span className="text-[10px] text-zinc-500">({recentsCount})</span>
                )}
              </button>

              <button
                onClick={() => onTabChange('admin')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage</span>
              </button>
            </nav>

            {/* Refresh Playlist Button */}
            <button
              onClick={onRefreshPlaylist}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh IPTV playlist"
            >
              <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 pt-1 md:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Tamil channels..."
              className="w-full pl-9 pr-9 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
