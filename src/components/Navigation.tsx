import React, { useState } from 'react';
import {
  Film,
  Tv,
  Radio,
  Search,
  Bookmark,
  History,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Crown,
  PlaySquare,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User, AdminUser } from '../types/ott';

export type OTTPage =
  | 'home'
  | 'movies'
  | 'channels'
  | 'livetv'
  | 'subscription'
  | 'search'
  | 'watchlist'
  | 'history'
  | 'profile'
  | 'admin_login'
  | 'admin_dashboard';

interface NavigationProps {
  currentPage: OTTPage;
  onNavigate: (page: OTTPage) => void;
  currentUser: User | null;
  currentAdmin: AdminUser | null;
  onOpenUserAuth: () => void;
  onUserLogout: () => void;
  onAdminLogout: () => void;
  watchlistCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  currentAdmin,
  onOpenUserAuth,
  onUserLogout,
  onAdminLogout,
  watchlistCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks: { id: OTTPage; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Film className="w-4 h-4" /> },
    { id: 'movies', label: 'Movies', icon: <PlaySquare className="w-4 h-4" /> },
    { id: 'channels', label: 'TV Channels', icon: <Radio className="w-4 h-4" /> },
    { id: 'livetv', label: 'Live TV', icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
    { id: 'subscription', label: 'VIP Plans', icon: <Crown className="w-4 h-4 text-amber-400" /> },
  ];

  const handleNavClick = (page: OTTPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 transition-all select-none">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  TamilFlix
                </span>
                <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 uppercase">
                  OTT + Live
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                Movies · Live Streams · 130+ Live Channels
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-amber-400 font-semibold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Search, Watchlist, User Profile, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button */}
            <button
              onClick={() => handleNavClick('search')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'search'
                  ? 'bg-zinc-800 text-amber-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
              title="Search movies, shows, channels"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Watchlist */}
            <button
              onClick={() => handleNavClick('watchlist')}
              className={`p-2 rounded-lg transition-colors relative cursor-pointer ${
                currentPage === 'watchlist'
                  ? 'bg-zinc-800 text-amber-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
              title="My Watchlist"
            >
              <Bookmark className="w-4 h-4" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-zinc-950 font-bold text-[9px] rounded-full">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Watch History */}
            <button
              onClick={() => handleNavClick('history')}
              className={`p-2 rounded-lg transition-colors hidden sm:block cursor-pointer ${
                currentPage === 'history'
                  ? 'bg-zinc-800 text-amber-400'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
              title="Watch History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Admin Portal Gateway */}
            {currentAdmin ? (
              <button
                onClick={() => handleNavClick('admin_dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentPage === 'admin_dashboard'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                }`}
                title="Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Hub</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('admin_login')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Admin Control Login"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  {currentUser.isPremium && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  )}
                  <span className="text-xs font-medium text-zinc-200 hidden md:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <p className="font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {currentUser.isPremium ? 'VIP Premium Active' : 'Free Account'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Profile & VIP</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('subscription')}
                      className="w-full px-3 py-2 text-left text-amber-400 hover:text-amber-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>VIP Subscriptions</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('watchlist')}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>My Watchlist</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('history')}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Watch History</span>
                    </button>

                    <div className="my-1 border-t border-zinc-800" />

                    <button
                      onClick={() => {
                        onUserLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenUserAuth}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-800 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2.5 ${
                  currentPage === link.id
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-850'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}

            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-1">
              <button
                onClick={() => handleNavClick('watchlist')}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center justify-between text-zinc-300 hover:bg-zinc-850"
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span>My Watchlist</span>
                </span>
                {watchlistCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-zinc-950 font-bold px-1.5 rounded">
                    {watchlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('history')}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 text-zinc-300 hover:bg-zinc-850"
              >
                <History className="w-4 h-4" />
                <span>Watch History</span>
              </button>

              <button
                onClick={() => handleNavClick(currentAdmin ? 'admin_dashboard' : 'admin_login')}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 text-amber-400 hover:bg-zinc-850"
              >
                <Shield className="w-4 h-4" />
                <span>{currentAdmin ? 'Admin Control Hub' : 'Admin Login'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
