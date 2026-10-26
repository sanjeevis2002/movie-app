import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Film,
  Tv,
  Radio,
  Star,
  History,
  Bookmark,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  Search,
  Crown,
} from 'lucide-react';
import { Channel, AdminSettings as IptvAdminSettings, RecentItem } from './types/iptv';
import {
  Movie,
  LiveStream,
  MediaFile,
  SiteSettings,
  AdminActivityLog,
  User,
  AdminUser,
  WatchlistItem,
  WatchHistoryItem,
} from './types/ott';
import { DEFAULT_TAMIL_PLAYLIST_URL, fetchAndParsePlaylist } from './services/m3uParser';
import {
  getStoredChannels,
  saveStoredChannels,
  getFavorites,
  saveFavorites,
  getRecentChannels,
  recordRecentChannel,
  clearRecentChannels,
  getAdminSettings as getIptvSettings,
  saveAdminSettings as saveIptvSettings,
} from './services/storage';
import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  getLiveStreams,
  addLiveStream,
  updateLiveStream,
  deleteLiveStream,
  getMediaFiles,
  addMediaFile,
  deleteMediaFile,
  getSiteSettings,
  saveSiteSettings,
  getAdminLogs,
  getCurrentUser,
  setCurrentUser,
  getCurrentAdmin,
  setCurrentAdmin,
  getRegisteredUsers,
  getWatchlist,
  toggleWatchlist,
  isItemInWatchlist,
  getWatchHistory,
  recordWatchHistory,
  clearWatchHistory,
  toggleUserPremiumStatus,
} from './services/ottStorage';
import { FALLBACK_TAMIL_CHANNELS } from './data/fallbackChannels';

// Components
import { Navigation, OTTPage } from './components/Navigation';
import { HeroBanner } from './components/HeroBanner';
import { ContentCarousel } from './components/ContentCarousel';
import { HomeLiveRow } from './components/HomeLiveRow';
import { MoviesPage } from './components/MoviesPage';
import { LiveStreamingPage } from './components/LiveStreamingPage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { SearchPage } from './components/SearchPage';
import { WatchlistPage } from './components/WatchlistPage';
import { WatchHistoryPage } from './components/WatchHistoryPage';
import { MovieDetailModal } from './components/MovieDetailModal';
import { UserAuthModal, AdminLoginModal, UserProfileView } from './components/AuthModals';
import { AdminLoginPage } from './components/AdminLoginPage';
import { FullAdminDashboard } from './components/FullAdminDashboard';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelCard } from './components/ChannelCard';
import { CategoryFilter } from './components/CategoryFilter';
import { RecentChannelsBar } from './components/RecentChannelsBar';
import { EditChannelModal } from './components/EditChannelModal';

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState<OTTPage>('home');

  // OTT Data State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [siteSettings, setSiteSettingsState] = useState<SiteSettings>(getSiteSettings());
  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>(getAdminLogs());

  // IPTV Channels State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelFavorites, setChannelFavorites] = useState<string[]>([]);
  const [channelRecents, setChannelRecents] = useState<RecentItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [channelSearchQuery, setChannelSearchQuery] = useState<string>('');
  const [isRefreshingChannels, setIsRefreshingChannels] = useState<boolean>(false);
  const [iptvSettings, setIptvSettings] = useState<IptvAdminSettings>(getIptvSettings());
  const [channelViewMode, setChannelViewMode] = useState<'grid' | 'compact'>('grid');
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState<Channel | null>(null);

  // Authentication & User State
  const [currentUser, setCurrentUserState] = useState<User | null>(getCurrentUser());
  const [currentAdmin, setCurrentAdminState] = useState<AdminUser | null>(getCurrentAdmin());
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(getRegisteredUsers());
  const [watchlist, setWatchlistState] = useState<WatchlistItem[]>(getWatchlist());
  const [watchHistory, setWatchHistoryState] = useState<WatchHistoryItem[]>(getWatchHistory());

  // Modals
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [userAuthOpen, setUserAuthOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  // Active Playback Overlay for Movies / Episodes / Custom
  const [activePlayback, setActivePlayback] = useState<{
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    category: string;
  } | null>(null);

  // Premium Content Access Protection Alert
  const [premiumLockAlert, setPremiumLockAlert] = useState<{
    isOpen: boolean;
    title: string;
    reason: 'no_auth' | 'no_subscription' | 'subscription_expired';
  } | null>(null);

  // URL Routing & Admin Access Control
  const [accessDeniedNotice, setAccessDeniedNotice] = useState<string | null>(null);

  // Synchronized navigation function with browser history URL support
  const navigateTo = useCallback((page: OTTPage) => {
    if (page === 'admin_dashboard') {
      const admin = getCurrentAdmin();
      if (admin) {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
        setAccessDeniedNotice(null);
        setCurrentPage('admin_dashboard');
      } else {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
        const user = getCurrentUser();
        if (user) {
          setAccessDeniedNotice(
            `Access Denied: Logged in as standard user "${user.name}". Administrative credentials are required to enter the control portal.`
          );
        } else {
          setAccessDeniedNotice(null);
        }
        setCurrentPage('admin_login');
      }
    } else if (page === 'admin_login') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
      const user = getCurrentUser();
      if (user && !getCurrentAdmin()) {
        setAccessDeniedNotice(
          `Access Denied: Logged in as standard user "${user.name}". Administrative credentials are required.`
        );
      } else {
        setAccessDeniedNotice(null);
      }
      setCurrentPage('admin_login');
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
      setAccessDeniedNotice(null);
      setCurrentPage(page);
    }
  }, []);

  // Handle direct navigation to /admin or initial mount & popstate
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        const adminSession = getCurrentAdmin();
        if (adminSession) {
          setCurrentAdminState(adminSession);
          setAccessDeniedNotice(null);
          setCurrentPage('admin_dashboard');
        } else {
          const userSession = getCurrentUser();
          if (userSession) {
            setAccessDeniedNotice(
              `Access Denied: Logged in as standard user "${userSession.name}". Administrator privileges are required to access the admin portal.`
            );
          } else {
            setAccessDeniedNotice(null);
          }
          setCurrentPage('admin_login');
        }
      } else if (path === '/' || path === '') {
        setCurrentPage((prev) => (prev === 'admin_login' || prev === 'admin_dashboard' ? 'home' : prev));
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Load initial OTT and IPTV state
  useEffect(() => {
    setMovies(getMovies());
    setLiveStreams(getLiveStreams());
    setMediaFiles(getMediaFiles());
    setSiteSettingsState(getSiteSettings());
    setAdminLogs(getAdminLogs());
    setWatchlistState(getWatchlist());
    setWatchHistoryState(getWatchHistory());
    setChannelFavorites(getFavorites());
    setChannelRecents(getRecentChannels());
  }, []);

  // Load IPTV Channels
  const loadChannels = useCallback(async () => {
    const stored = getStoredChannels();
    if (stored && stored.length > 0) {
      setChannels(stored);
      setSelectedChannel(stored.find((c) => c.enabled !== false) || stored[0]);
      return;
    }

    try {
      const { channels: fetched, log } = await fetchAndParsePlaylist(DEFAULT_TAMIL_PLAYLIST_URL);
      const favs = getFavorites();
      const merged = fetched.map((c) => ({
        ...c,
        isFavorite: favs.includes(c.id),
      }));
      setChannels(merged);
      saveStoredChannels(merged);
      const updated = saveIptvSettings({
        lastImportTime: Date.now(),
        importLogs: [log],
      });
      setIptvSettings(updated);
      if (merged.length > 0) {
        setSelectedChannel(merged[0]);
      }
    } catch {
      setChannels(FALLBACK_TAMIL_CHANNELS);
      saveStoredChannels(FALLBACK_TAMIL_CHANNELS);
      if (FALLBACK_TAMIL_CHANNELS.length > 0) {
        setSelectedChannel(FALLBACK_TAMIL_CHANNELS[0]);
      }
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // Refresh IPTV channels
  const handleRefreshIPTV = async () => {
    setIsRefreshingChannels(true);
    try {
      const { channels: fetched, log } = await fetchAndParsePlaylist(
        iptvSettings.playlistUrl || DEFAULT_TAMIL_PLAYLIST_URL
      );
      const customChannels = channels.filter((c) => c.isCustom);
      const favs = getFavorites();
      const merged = fetched.map((c) => ({
        ...c,
        isFavorite: favs.includes(c.id),
      }));
      const combined = [...customChannels, ...merged];
      setChannels(combined);
      saveStoredChannels(combined);
      const updated = saveIptvSettings({
        lastImportTime: Date.now(),
        importLogs: [log, ...(iptvSettings.importLogs || [])].slice(0, 10),
      });
      setIptvSettings(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingChannels(false);
    }
  };

  // Play Movie
  const handlePlayMovie = (movie: Movie) => {
    setActivePlayback({
      id: movie.id,
      title: movie.title,
      url: movie.videoUrl,
      thumbnail: movie.poster,
      category: 'Movie',
    });
    if (currentUser) {
      recordWatchHistory(currentUser.id, movie.id, 'movie', movie.title, movie.poster, 120, movie.duration * 60);
      setWatchHistoryState(getWatchHistory(currentUser.id));
    }
  };

  // Play IPTV Channel
  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    recordRecentChannel(channel.id);
    setChannelRecents(getRecentChannels());
  };

  // Play Live Stream
  const handlePlayLiveStream = (stream: LiveStream) => {
    setActivePlayback({
      id: stream.id,
      title: stream.title,
      url: stream.streamUrl,
      thumbnail: stream.thumbnail,
      category: 'Live Broadcast',
    });
  };

  // Watchlist Toggle
  const handleToggleWatchlist = (item: Movie) => {
    const userId = currentUser?.id || 'guest';
    toggleWatchlist({
      userId,
      contentId: item.id,
      contentType: 'movie',
      title: item.title,
      poster: item.poster,
      rating: item.rating,
      releaseYear: item.releaseYear,
      category: item.genre[0],
    });
    setWatchlistState(getWatchlist(userId));
  };

  // Resume History item
  const handleResumeHistoryItem = (h: WatchHistoryItem) => {
    const movie = movies.find((m) => m.id === h.contentId);
    if (movie) return handlePlayMovie(movie);

    const ch = channels.find((c) => c.id === h.contentId);
    if (ch) return handlePlayChannel(ch);

    const live = liveStreams.find((l) => l.id === h.contentId);
    if (live) return handlePlayLiveStream(live);
  };

  // Featured items for Hero Banner
  const heroFeaturedItems = useMemo(() => {
    return movies.filter((m) => m.isFeatured).slice(0, 5);
  }, [movies]);

  // Unique categories for IPTV channels
  const iptvCategoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const enabled = channels.filter((c) => c.enabled !== false);
    enabled.forEach((c) => {
      const g = c.group || 'Tamil';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [channels]);

  // Filtered IPTV Channels
  const filteredIPTVChannels = useMemo(() => {
    let list = channels.filter((c) => c.enabled !== false);
    if (activeCategory !== 'all') {
      list = list.filter((c) => c.group && c.group.toLowerCase() === activeCategory.toLowerCase());
    }
    if (channelSearchQuery.trim()) {
      const q = channelSearchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.cleanName.toLowerCase().includes(q) ||
          (c.group && c.group.toLowerCase().includes(q))
      );
    }
    return list;
  }, [channels, activeCategory, channelSearchQuery]);

  // Recent channel objects
  const recentChannelObjects = useMemo(() => {
    return channelRecents
      .map((r) => channels.find((c) => c.id === r.channelId))
      .filter((c): c is Channel => !!c && c.enabled !== false);
  }, [channelRecents, channels]);

  // Render dedicated full-page Admin Login if on /admin and unauthenticated
  if (currentPage === 'admin_login' || (currentPage === 'admin_dashboard' && !currentAdmin)) {
    return (
      <AdminLoginPage
        onSuccess={(admin) => {
          setCurrentAdminState(admin);
          setCurrentAdmin(admin);
          setAccessDeniedNotice(null);
          navigateTo('admin_dashboard');
        }}
        onBackToSite={() => {
          setAccessDeniedNotice(null);
          navigateTo('home');
        }}
        accessDeniedNotice={accessDeniedNotice}
      />
    );
  }

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* Global Header Navigation */}
      <Navigation
        currentPage={currentPage}
        onNavigate={(page) => navigateTo(page)}
        currentUser={currentUser}
        currentAdmin={currentAdmin}
        onOpenUserAuth={() => setUserAuthOpen(true)}
        onUserLogout={() => {
          setCurrentUser(null);
          setCurrentUserState(null);
        }}
        onAdminLogout={() => {
          setCurrentAdmin(null);
          setCurrentAdminState(null);
          if (window.location.pathname === '/admin') {
            window.history.pushState(null, '', '/');
          }
          setCurrentPage('home');
        }}
        watchlistCount={watchlist.length}
      />

      {/* Main View Port Container - Full responsive width */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 pb-24 md:pb-12">
        {/* ACTIVE PLAYBACK MODAL / BANNER */}
        {activePlayback && (
          <div className="mb-8 bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl space-y-3 p-2">
            <VideoPlayer
              channel={{
                id: activePlayback.id,
                name: activePlayback.title,
                cleanName: activePlayback.title,
                url: activePlayback.url,
                logo: activePlayback.thumbnail,
                group: activePlayback.category,
                enabled: true,
              }}
              onClose={() => setActivePlayback(null)}
            />
          </div>
        )}

        {/* 1. HOME VIEW */}
        {currentPage === 'home' && (
          <div className="space-y-10">
            {/* Hero Carousel Banner */}
            <HeroBanner
              featuredItems={heroFeaturedItems}
              onPlay={(item) => handlePlayMovie(item)}
              onOpenDetails={(item) => setSelectedMovie(item)}
              onToggleWatchlist={handleToggleWatchlist}
              isItemInWatchlist={(id) => isItemInWatchlist(currentUser?.id || 'guest', id)}
            />

            {/* Continue Watching / History Strip (if history exists) */}
            {watchHistory.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Continue Watching</span>
                  </h3>
                  <button
                    onClick={() => setCurrentPage('history')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    View All History
                  </button>
                </div>
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                  {watchHistory.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleResumeHistoryItem(item)}
                      className="group relative flex-none w-[200px] sm:w-[240px] rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 cursor-pointer hover:border-amber-500/80 transition-colors"
                    >
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-950 mb-2">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
                          <div
                            className="h-full bg-amber-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((item.progressSeconds / Math.max(1, item.durationSeconds)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">{item.contentType}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. HOME PAGE LIVE SECTION — SINGLE HORIZONTAL ROW */}
            <HomeLiveRow
              liveStreams={liveStreams}
              onPlayLiveStream={(stream) => handlePlayLiveStream(stream)}
              onViewAll={() => setCurrentPage('livetv')}
              title="Live"
              subtitle="Breaking studio broadcasts, debates, red carpet galas, and live feeds"
            />

            {/* Trending Blockbuster Movies */}
            <ContentCarousel
              title="Blockbuster Tamil Movies"
              subtitle="Latest theatrical releases and all-time fan favorites"
              items={movies}
              onPlay={(item) => handlePlayMovie(item as Movie)}
              onOpenDetails={(item) => setSelectedMovie(item as Movie)}
              onToggleWatchlist={(item) => handleToggleWatchlist(item as Movie)}
              isItemInWatchlist={(id) => isItemInWatchlist(currentUser?.id || 'guest', id)}
              onViewAll={() => setCurrentPage('movies')}
            />

            {/* Live TV Channels Quick Rail */}
            <div className="mb-10">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    <span>Live Tamil TV Channels (130+ Feeds)</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Continuous live broadcasts from News, Music, Entertainment, and Spiritual networks
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPage('channels')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Browse All Channels
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {channels
                  .filter((c) => c.enabled !== false)
                  .slice(0, 12)
                  .map((ch) => (
                    <ChannelCard
                      key={ch.id}
                      channel={ch}
                      isActive={selectedChannel?.id === ch.id}
                      isFavorite={channelFavorites.includes(ch.id)}
                      onSelect={(c) => handlePlayChannel(c)}
                      onToggleFavorite={(id, e) => {
                        e.stopPropagation();
                        const next = channelFavorites.includes(id)
                          ? channelFavorites.filter((x) => x !== id)
                          : [...channelFavorites, id];
                        saveFavorites(next);
                        setChannelFavorites(next);
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. MOVIES PAGE */}
        {currentPage === 'movies' && (
          <MoviesPage
            movies={movies}
            onPlay={handlePlayMovie}
            onOpenDetails={(m) => setSelectedMovie(m)}
            onToggleWatchlist={handleToggleWatchlist}
            isItemInWatchlist={(id) => isItemInWatchlist(currentUser?.id || 'guest', id)}
          />
        )}

        {/* 5. TV CHANNELS (IPTV) PAGE */}
        {currentPage === 'channels' && (
          <div className="space-y-6">
            {/* Live TV Video Player */}
            {selectedChannel && (
              <section aria-label="IPTV Player" className="space-y-3">
                <VideoPlayer
                  channel={selectedChannel}
                  onNextChannel={() => {
                    const idx = filteredIPTVChannels.findIndex((c) => c.id === selectedChannel.id);
                    if (idx !== -1 && filteredIPTVChannels.length > 1) {
                      handlePlayChannel(filteredIPTVChannels[(idx + 1) % filteredIPTVChannels.length]);
                    }
                  }}
                  onPrevChannel={() => {
                    const idx = filteredIPTVChannels.findIndex((c) => c.id === selectedChannel.id);
                    if (idx !== -1 && filteredIPTVChannels.length > 1) {
                      handlePlayChannel(
                        filteredIPTVChannels[(idx - 1 + filteredIPTVChannels.length) % filteredIPTVChannels.length]
                      );
                    }
                  }}
                  onFavoriteToggle={(id) => {
                    const next = channelFavorites.includes(id)
                      ? channelFavorites.filter((x) => x !== id)
                      : [...channelFavorites, id];
                    saveFavorites(next);
                    setChannelFavorites(next);
                  }}
                  isFavorite={channelFavorites.includes(selectedChannel.id)}
                />
              </section>
            )}

            {/* Recent Channels Strip */}
            {recentChannelObjects.length > 0 && (
              <RecentChannelsBar
                channels={recentChannelObjects}
                onSelectChannel={handlePlayChannel}
                onClearRecents={() => {
                  clearRecentChannels();
                  setChannelRecents([]);
                }}
                activeChannelId={selectedChannel?.id}
              />
            )}

            {/* Filter and View mode bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    <span>Tamil Live TV Channels</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      ({filteredIPTVChannels.length} channels)
                    </span>
                  </h1>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Search inside channels */}
                  <div className="relative w-48 sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      value={channelSearchQuery}
                      onChange={(e) => setChannelSearchQuery(e.target.value)}
                      placeholder="Search channels..."
                      className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Grid / Compact */}
                  <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <button
                      onClick={() => setChannelViewMode('grid')}
                      className={`p-1.5 rounded-md ${channelViewMode === 'grid' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500'}`}
                      title="Grid"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setChannelViewMode('compact')}
                      className={`p-1.5 rounded-md ${channelViewMode === 'compact' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500'}`}
                      title="List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Category Chips */}
              <CategoryFilter
                categories={iptvCategoriesWithCounts}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>

            {/* Channel Cards Grid */}
            {channelViewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {filteredIPTVChannels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    isActive={selectedChannel?.id === channel.id}
                    isFavorite={channelFavorites.includes(channel.id)}
                    onSelect={handlePlayChannel}
                    onToggleFavorite={(id, e) => {
                      e.stopPropagation();
                      const next = channelFavorites.includes(id)
                        ? channelFavorites.filter((x) => x !== id)
                        : [...channelFavorites, id];
                      saveFavorites(next);
                      setChannelFavorites(next);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
                {filteredIPTVChannels.map((channel) => {
                  const isActive = selectedChannel?.id === channel.id;
                  const isFav = channelFavorites.includes(channel.id);
                  return (
                    <div
                      key={channel.id}
                      onClick={() => handlePlayChannel(channel)}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                        isActive ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-zinc-850/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
                          {channel.logo ? (
                            <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                          ) : (
                            <Radio className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-xs sm:text-sm truncate ${isActive ? 'text-amber-400' : 'text-zinc-100'}`}>
                            {channel.cleanName || channel.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">{channel.group || 'Tamil'}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = channelFavorites.includes(channel.id)
                            ? channelFavorites.filter((x) => x !== channel.id)
                            : [...channelFavorites, channel.id];
                          saveFavorites(next);
                          setChannelFavorites(next);
                        }}
                        className={`p-1.5 rounded-lg ${isFav ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-300'}`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. LIVE TV BROADCASTS PAGE */}
        {currentPage === 'livetv' && <LiveStreamingPage liveStreams={liveStreams} />}

        {/* 6B. SUBSCRIPTION PLANS & IMB PAYMENT GATEWAY */}
        {currentPage === 'subscription' && (
          <SubscriptionPage
            currentUser={currentUser}
            onOpenUserAuth={() => setUserAuthOpen(true)}
            onSubscriptionUpdated={() => {
              if (currentUser) {
                setCurrentUserState({ ...currentUser, isPremium: true });
              }
            }}
          />
        )}

        {/* 7. SEARCH PAGE */}
        {currentPage === 'search' && (
          <SearchPage
            movies={movies}
            channels={channels}
            liveStreams={liveStreams}
            onPlayMovie={handlePlayMovie}
            onPlayChannel={handlePlayChannel}
            onPlayLiveStream={handlePlayLiveStream}
          />
        )}

        {/* 8. MY WATCHLIST PAGE */}
        {currentPage === 'watchlist' && (
          <WatchlistPage
            watchlist={watchlist}
            onRemoveItem={(contentId) => {
              toggleWatchlist({
                userId: currentUser?.id || 'guest',
                contentId,
                contentType: 'movie',
                title: '',
                poster: '',
              });
              setWatchlistState(getWatchlist(currentUser?.id || 'guest'));
            }}
            onPlayItem={(w) => {
              const movie = movies.find((m) => m.id === w.contentId);
              if (movie) return handlePlayMovie(movie);
              const channel = channels.find((c) => c.id === w.contentId);
              if (channel) return handlePlayChannel(channel);
            }}
          />
        )}

        {/* 9. WATCH HISTORY PAGE */}
        {currentPage === 'history' && (
          <WatchHistoryPage
            history={watchHistory}
            onClearHistory={() => {
              if (currentUser) clearWatchHistory(currentUser.id);
              setWatchHistoryState([]);
            }}
            onResumeItem={handleResumeHistoryItem}
          />
        )}

        {/* 10. USER PROFILE VIEW */}
        {currentPage === 'profile' && currentUser && (
          <UserProfileView
            user={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              setCurrentUserState(null);
              setCurrentPage('home');
            }}
            onUpdate={(u) => {
              setCurrentUserState(u);
            }}
            onNavigateToSubscription={() => setCurrentPage('subscription')}
          />
        )}

        {/* 11. ADMIN DASHBOARD (FULL CONTROL) */}
        {currentPage === 'admin_dashboard' && currentAdmin && (
          <FullAdminDashboard
            currentAdmin={currentAdmin}
            onLogout={() => {
              setCurrentAdmin(null);
              setCurrentAdminState(null);
              setCurrentPage('home');
            }}
            movies={movies}
            channels={channels}
            liveStreams={liveStreams}
            mediaFiles={mediaFiles}
            users={registeredUsers}
            siteSettings={siteSettings}
            adminLogs={adminLogs}
            iptvSettings={iptvSettings}
            onAddMovie={(m) => {
              addMovie(m, currentAdmin.name);
              setMovies(getMovies());
              setAdminLogs(getAdminLogs());
            }}
            onUpdateMovie={(m) => {
              updateMovie(m, currentAdmin.name);
              setMovies(getMovies());
              setAdminLogs(getAdminLogs());
            }}
            onDeleteMovie={(id) => {
              deleteMovie(id, currentAdmin.name);
              setMovies(getMovies());
              setAdminLogs(getAdminLogs());
            }}
            onAddLiveStream={(l) => {
              addLiveStream(l, currentAdmin.name);
              setLiveStreams(getLiveStreams());
              setAdminLogs(getAdminLogs());
            }}
            onUpdateLiveStream={(l) => {
              updateLiveStream(l, currentAdmin.name);
              setLiveStreams(getLiveStreams());
              setAdminLogs(getAdminLogs());
            }}
            onDeleteLiveStream={(id) => {
              deleteLiveStream(id, currentAdmin.name);
              setLiveStreams(getLiveStreams());
              setAdminLogs(getAdminLogs());
            }}
            onAddMediaFile={(f) => {
              addMediaFile(f, currentAdmin.name);
              setMediaFiles(getMediaFiles());
              setAdminLogs(getAdminLogs());
            }}
            onDeleteMediaFile={(id) => {
              deleteMediaFile(id, currentAdmin.name);
              setMediaFiles(getMediaFiles());
              setAdminLogs(getAdminLogs());
            }}
            onAddChannel={() => {
              setChannelToEdit(null);
              setIsEditChannelModalOpen(true);
            }}
            onEditChannel={(ch) => {
              setChannelToEdit(ch);
              setIsEditChannelModalOpen(true);
            }}
            onDeleteChannel={(id) => {
              const next = channels.filter((c) => c.id !== id);
              setChannels(next);
              saveStoredChannels(next);
            }}
            onToggleChannelEnabled={(id) => {
              const next = channels.map((c) =>
                c.id === id ? { ...c, enabled: c.enabled === false ? true : false } : c
              );
              setChannels(next);
              saveStoredChannels(next);
            }}
            onToggleChannelFeatured={(id) => {
              const next = channels.map((c) => (c.id === id ? { ...c, isFeatured: !c.isFeatured } : c));
              setChannels(next);
              saveStoredChannels(next);
            }}
            onToggleChannelFavorite={(id) => {
              const next = channelFavorites.includes(id)
                ? channelFavorites.filter((x) => x !== id)
                : [...channelFavorites, id];
              saveFavorites(next);
              setChannelFavorites(next);
            }}
            onImportChannelsPlaylist={async (url) => {
              const { channels: fetched, log } = await fetchAndParsePlaylist(url);
              const custom = channels.filter((c) => c.isCustom);
              const merged = [...custom, ...fetched];
              setChannels(merged);
              saveStoredChannels(merged);
              const updated = saveIptvSettings({
                playlistUrl: url,
                lastImportTime: Date.now(),
                importLogs: [log, ...(iptvSettings.importLogs || [])].slice(0, 10),
              });
              setIptvSettings(updated);
            }}
            onResetChannelsDefault={() => {
              setChannels(FALLBACK_TAMIL_CHANNELS);
              saveStoredChannels(FALLBACK_TAMIL_CHANNELS);
            }}
            onPlayChannel={handlePlayChannel}
            onSaveSiteSettings={(st) => {
              saveSiteSettings(st, currentAdmin.name);
              setSiteSettingsState(st);
              setAdminLogs(getAdminLogs());
            }}
            onToggleUserStatus={(uid) => {
              const updated = registeredUsers.map((u) =>
                u.id === uid ? { ...u, status: (u.status === 'active' ? 'suspended' : 'active') as User['status'] } : u
              );
              setRegisteredUsers(updated);
            }}
            onToggleUserVip={(uid) => {
              toggleUserPremiumStatus(uid);
              setRegisteredUsers(getRegisteredUsers());
              if (currentUser?.id === uid) {
                setCurrentUserState(getCurrentUser());
              }
            }}
          />
        )}
      </main>

      {/* MODALS */}
      {/* 1. Movie Details Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onToggleWatchlist={handleToggleWatchlist}
        inWatchlist={selectedMovie ? isItemInWatchlist(currentUser?.id || 'guest', selectedMovie.id) : false}
      />

      {/* 3. User Authentication Modal */}
      <UserAuthModal
        isOpen={userAuthOpen}
        onClose={() => setUserAuthOpen(false)}
        onSuccess={(u) => {
          setCurrentUserState(u);
          setWatchlistState(getWatchlist(u.id));
          setWatchHistoryState(getWatchHistory(u.id));
        }}
      />

      {/* 4. Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={(a) => {
          setCurrentAdminState(a);
          setCurrentPage('admin_dashboard');
        }}
      />

      {/* 5. IPTV Channel Edit / Add Modal */}
      <EditChannelModal
        isOpen={isEditChannelModalOpen}
        channel={channelToEdit}
        existingCategories={iptvCategoriesWithCounts.map((c) => c.name)}
        onClose={() => {
          setIsEditChannelModalOpen(false);
          setChannelToEdit(null);
        }}
        onSave={(updated) => {
          let next: Channel[];
          if (channels.some((c) => c.id === updated.id)) {
            next = channels.map((c) => (c.id === updated.id ? updated : c));
          } else {
            next = [updated, ...channels];
          }
          setChannels(next);
          saveStoredChannels(next);
          setIsEditChannelModalOpen(false);
        }}
      />

      {/* 6. Premium VIP Access Locked Modal (Module 7) */}
      {premiumLockAlert && premiumLockAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
          <div className="w-full max-w-md bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Crown className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                VIP Access Protected
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                TamilFlix VIP Pass Required
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs mx-auto">
                {premiumLockAlert.reason === 'no_auth'
                  ? `Please sign in or create an account to stream "${premiumLockAlert.title}".`
                  : premiumLockAlert.reason === 'subscription_expired'
                  ? `Your previous subscription has expired. Renew your plan to unlock "${premiumLockAlert.title}".`
                  : `"${premiumLockAlert.title}" is exclusively available to VIP subscribers.`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Plans start from just ₹99 / 30 Days</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Choose Basic, Premium, or Ultimate. Secured by certified IMB Payment Gateway.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const reason = premiumLockAlert.reason;
                  setPremiumLockAlert(null);
                  if (reason === 'no_auth' && !currentUser) {
                    setUserAuthOpen(true);
                  } else {
                    setCurrentPage('subscription');
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {!currentUser && premiumLockAlert.reason === 'no_auth'
                  ? 'Sign In to Account'
                  : 'View 3 Subscription Plans (From ₹99)'}
              </button>

              <button
                type="button"
                onClick={() => setPremiumLockAlert(null)}
                className="w-full py-2.5 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
