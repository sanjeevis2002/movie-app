import React, { useState } from 'react';
import {
  LayoutDashboard,
  Film,
  Tv,
  Radio,
  Sparkles,
  Image as ImageIcon,
  Users,
  Settings,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  Power,
  Star,
  ShieldCheck,
  Search,
  Upload,
  Layers,
  RotateCcw,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import {
  Movie,
  LiveStream,
  MediaFile,
  SiteSettings,
  AdminActivityLog,
  AdminUser,
  User,
} from '../types/ott';
import { Channel, AdminSettings as IptvAdminSettings } from '../types/iptv';
import { AdminPanel } from './AdminPanel';
import { AdminSubscriptionManager } from './AdminSubscriptionManager';

export type AdminMenuTab =
  | 'overview'
  | 'subscriptions'
  | 'movies'
  | 'channels'
  | 'livestreams'
  | 'medialibrary'
  | 'users'
  | 'settings'
  | 'logs';

interface FullAdminDashboardProps {
  currentAdmin: AdminUser;
  onLogout: () => void;
  movies: Movie[];
  channels: Channel[];
  liveStreams: LiveStream[];
  mediaFiles: MediaFile[];
  users: User[];
  siteSettings: SiteSettings;
  adminLogs: AdminActivityLog[];
  iptvSettings: IptvAdminSettings;
  // Movies Actions
  onAddMovie: (movie: Movie) => void;
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
  // Live Streams Actions
  onAddLiveStream: (stream: LiveStream) => void;
  onUpdateLiveStream: (stream: LiveStream) => void;
  onDeleteLiveStream: (id: string) => void;
  // Media Actions
  onAddMediaFile: (file: MediaFile) => void;
  onDeleteMediaFile: (id: string) => void;
  // Channels Actions (IPTV)
  onAddChannel: () => void;
  onEditChannel: (ch: Channel) => void;
  onDeleteChannel: (id: string) => void;
  onToggleChannelEnabled: (id: string) => void;
  onToggleChannelFeatured: (id: string) => void;
  onToggleChannelFavorite: (id: string) => void;
  onImportChannelsPlaylist: (url: string) => Promise<void>;
  onResetChannelsDefault: () => void;
  onPlayChannel: (ch: Channel) => void;
  // Settings & Users
  onSaveSiteSettings: (settings: SiteSettings) => void;
  onToggleUserStatus: (userId: string) => void;
  onToggleUserVip: (userId: string) => void;
}

export const FullAdminDashboard: React.FC<FullAdminDashboardProps> = ({
  currentAdmin,
  onLogout,
  movies,
  channels,
  liveStreams,
  mediaFiles,
  users,
  siteSettings,
  adminLogs,
  iptvSettings,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
  onAddLiveStream,
  onUpdateLiveStream,
  onDeleteLiveStream,
  onAddMediaFile,
  onDeleteMediaFile,
  onAddChannel,
  onEditChannel,
  onDeleteChannel,
  onToggleChannelEnabled,
  onToggleChannelFeatured,
  onToggleChannelFavorite,
  onImportChannelsPlaylist,
  onResetChannelsDefault,
  onPlayChannel,
  onSaveSiteSettings,
  onToggleUserStatus,
  onToggleUserVip,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('overview');

  // Modal states for CRUD forms
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const [liveStreamModalOpen, setLiveStreamModalOpen] = useState(false);
  const [editingLiveStream, setEditingLiveStream] = useState<LiveStream | null>(null);

  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);

  // In-app deletion confirmation state (replaces window.confirm to avoid iframe blocking)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Search filter inside tables
  const [tableSearch, setTableSearch] = useState('');

  // Metrics calculation
  const totalPublishedMovies = movies.filter((m) => m.status === 'published').length;
  const totalActiveChannels = channels.filter((c) => c.enabled !== false).length;
  const totalActiveLive = liveStreams.filter((l) => l.status === 'live').length;

  const sidebarLinks: { id: AdminMenuTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Payment & Subscriptions', icon: <CreditCard className="w-4 h-4 text-amber-400" /> },
    { id: 'movies', label: 'Movies', icon: <Film className="w-4 h-4" />, badge: movies.length },
    { id: 'channels', label: 'TV Channels (IPTV)', icon: <Radio className="w-4 h-4" />, badge: channels.length },
    { id: 'livestreams', label: 'Live Streaming', icon: <Sparkles className="w-4 h-4" />, badge: liveStreams.length },
    { id: 'medialibrary', label: 'Media Library', icon: <ImageIcon className="w-4 h-4" />, badge: mediaFiles.length },
    { id: 'users', label: 'Users & VIPs', icon: <Users className="w-4 h-4" />, badge: users.length },
    { id: 'settings', label: 'Website Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'logs', label: 'Audit Logs', icon: <FileText className="w-4 h-4" />, badge: adminLogs.length },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl select-none">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-zinc-900/80 border-b lg:border-b-0 lg:border-r border-zinc-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Identity */}
          <div className="p-3 mb-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentAdmin.name}</p>
              <p className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">
                {currentAdmin.role}
              </p>
            </div>
          </div>

          {/* Links list */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setTableSearch('');
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {link.icon}
                    <span>{link.label}</span>
                  </span>
                  {link.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Logout */}
        <div className="pt-4 mt-4 border-t border-zinc-800">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-5 sm:p-8 overflow-y-auto bg-zinc-950/40">
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">System Overview</h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Real-time inventory metrics, storage utilization, and publication status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Systems Operational
                </span>
              </div>
            </div>

            {/* Statistics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Movies</span>
                  <Film className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{movies.length}</p>
                <p className="text-[11px] text-emerald-400 mt-1">{totalPublishedMovies} published</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">IPTV Channels</span>
                  <Radio className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{channels.length}</p>
                <p className="text-[11px] text-emerald-400 mt-1">{totalActiveChannels} active</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Live Streams</span>
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{liveStreams.length}</p>
                <p className="text-[11px] text-rose-400 mt-1">{totalActiveLive} broadcasting</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Registered Users</span>
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{users.length}</p>
                <p className="text-[11px] text-cyan-400 mt-1">
                  {users.filter((u) => u.isPremium).length} VIP accounts
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Media Assets</span>
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">{mediaFiles.length}</p>
                <p className="text-[11px] text-zinc-400 mt-1">Images in library</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-xs font-medium">Last M3U Sync</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xs font-bold text-amber-300 mt-2">
                  {iptvSettings.lastImportTime
                    ? new Date(iptvSettings.lastImportTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Initial Seed'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Automated sync</p>
              </div>
            </div>

            {/* Recent Activity Ticker */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Recent Administrative Actions & Audits</span>
              </h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {adminLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{log.adminName}</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 rounded">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-zinc-400 mt-0.5 text-[11px]">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
 
        {/* TAB: PAYMENT & SUBSCRIPTIONS (IMB GATEWAY) */}
        {activeTab === 'subscriptions' && (
          <AdminSubscriptionManager adminName={currentAdmin.name} />
        )}

        {/* TAB 2: MOVIES MANAGEMENT */}
        {activeTab === 'movies' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white">Movies Manager</h2>
                <p className="text-xs text-zinc-400">
                  Add blockbuster films, configure streaming sources, and manage VIP restrictions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingMovie(null);
                    setMovieModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Movie</span>
                </button>
              </div>
            </div>

            {/* Movies Table */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-3.5 border-b border-zinc-800">
                <div className="relative max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search movies by title..."
                    className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Movie</th>
                      <th className="py-3 px-4">Genres & Year</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Access</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {movies
                      .filter((m) => m.title.toLowerCase().includes(tableSearch.toLowerCase()))
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-850/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={m.poster}
                                alt={m.title}
                                className="w-9 h-12 rounded object-cover bg-zinc-950 shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-white">{m.title}</p>
                                <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                                  {m.director}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">
                            <p>{m.genre.join(', ')}</p>
                            <span className="text-[11px] text-zinc-500">{m.releaseYear}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">{m.duration} mins</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                m.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {m.isPremium ? (
                              <span className="text-purple-400 font-bold text-[10px] flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> VIP
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-[10px]">Free</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingMovie(m);
                                  setMovieModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                title="Edit movie"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    isOpen: true,
                                    title: `Delete movie "${m.title}"?`,
                                    description: `Are you sure you want to delete "${m.title}"? This will permanently remove this movie from your catalog.`,
                                    onConfirm: () => onDeleteMovie(m.id),
                                  });
                                }}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                                title="Delete movie"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TV CHANNELS (IPTV) */}
        {activeTab === 'channels' && (
          <div className="space-y-4">
            <AdminPanel
              channels={channels}
              settings={iptvSettings}
              onAddChannel={onAddChannel}
              onEditChannel={onEditChannel}
              onDeleteChannel={onDeleteChannel}
              onToggleEnabled={onToggleChannelEnabled}
              onToggleFeatured={onToggleChannelFeatured}
              onToggleFavorite={onToggleChannelFavorite}
              onImportPlaylist={onImportChannelsPlaylist}
              onResetToDefault={onResetChannelsDefault}
              onPlayChannel={onPlayChannel}
            />
          </div>
        )}

        {/* TAB 6: LIVE STREAMING */}
        {activeTab === 'livestreams' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white">Live Streaming Broadcasts</h2>
                <p className="text-xs text-zinc-400">
                  Manage live news, sports events, award ceremonies, and scheduled streaming events.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingLiveStream(null);
                  setLiveStreamModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Create Live Stream</span>
              </button>
            </div>

            {/* Live Streams Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {liveStreams.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={st.thumbnail}
                      alt={st.title}
                      className="w-24 h-16 rounded-xl object-cover bg-zinc-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            st.status === 'live'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              : st.status === 'scheduled'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {st.status}
                        </span>
                        <span className="text-[11px] text-zinc-400">{st.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{st.title}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{st.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-500">
                    <span className="font-mono text-[10px] truncate max-w-[180px]">{st.streamUrl}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingLiveStream(st);
                          setLiveStreamModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            isOpen: true,
                            title: `Delete live broadcast "${st.title}"?`,
                            description: `Are you sure you want to remove the broadcast "${st.title}"?`,
                            onConfirm: () => onDeleteLiveStream(st.id),
                          });
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete live stream"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MEDIA LIBRARY */}
        {activeTab === 'medialibrary' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white">Centralized Media Library</h2>
                <p className="text-xs text-zinc-400">
                  Manage poster art, backdrop banners, episode stills, and website brand assets.
                </p>
              </div>

              <button
                onClick={() => setMediaUploadOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Media Asset</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaFiles.map((f) => (
                <div
                  key={f.id}
                  className="group relative rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden"
                >
                  <div className="aspect-[3/2] w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={f.fileUrl}
                      alt={f.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-white truncate">{f.fileName}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                      <span className="uppercase">{f.type}</span>
                      <span>{Math.round(f.size / 1024)} KB</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteConfirm({
                        isOpen: true,
                        title: `Delete media asset "${f.fileName}"?`,
                        description: `Are you sure you want to delete "${f.fileName}" from the media library?`,
                        onConfirm: () => onDeleteMediaFile(f.id),
                      });
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black cursor-pointer"
                    title="Delete media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: USERS & VIPS */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Users & VIPs</h2>
                <p className="text-xs text-zinc-400">
                  Manage user roles, VIP memberships, and account suspension statuses.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Membership</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-850/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                              alt={u.name}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <span className="font-semibold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                        <td className="py-3 px-4 text-center">
                          {u.isPremium ? (
                            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              VIP PREMIUM
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[10px]">Standard Free</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.status === 'active'
                                ? 'text-emerald-400 bg-emerald-950/50'
                                : 'text-red-400 bg-red-950/50'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onToggleUserVip(u.id)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] font-medium"
                            >
                              Toggle VIP
                            </button>
                            <button
                              onClick={() => onToggleUserStatus(u.id)}
                              className={`px-2 py-1 rounded text-[11px] font-medium ${
                                u.status === 'active'
                                  ? 'bg-zinc-800 hover:bg-red-950 text-red-400'
                                  : 'bg-emerald-950 text-emerald-400'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Website & Streaming Settings</h2>
              <p className="text-xs text-zinc-400">
                Configure platform branding, contact details, and streaming endpoints.
              </p>
            </div>

            {settingsSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Configuration changes saved successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Website Name</label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={settingsForm.siteTagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteTagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Default IPTV M3U Playlist Source
                </label>
                <input
                  type="url"
                  value={settingsForm.defaultM3uUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultM3uUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onSaveSiteSettings(settingsForm);
                    setSettingsSavedMsg(true);
                    setTimeout(() => setSettingsSavedMsg(false), 3000);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Administrative Audit Trail</h2>
              <p className="text-xs text-zinc-400">
                Immutable records of content publications, deletions, and security events.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
              {adminLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{log.adminName}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                        {log.action}
                      </span>
                      <span className="text-zinc-500">on {log.entityType}</span>
                    </div>
                    <p className="text-zinc-300 text-xs">{log.details}</p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: MOVIE FORM */}
      {movieModalOpen && (
        <MovieFormModal
          isOpen={movieModalOpen}
          movie={editingMovie}
          onClose={() => {
            setMovieModalOpen(false);
            setEditingMovie(null);
          }}
          onSave={(mov) => {
            if (editingMovie) {
              onUpdateMovie(mov);
            } else {
              onAddMovie(mov);
            }
            setMovieModalOpen(false);
            setEditingMovie(null);
          }}
        />
      )}

      {/* MODAL: LIVE STREAM FORM */}
      {liveStreamModalOpen && (
        <LiveStreamFormModal
          isOpen={liveStreamModalOpen}
          stream={editingLiveStream}
          onClose={() => {
            setLiveStreamModalOpen(false);
            setEditingLiveStream(null);
          }}
          onSave={(st) => {
            if (editingLiveStream) {
              onUpdateLiveStream(st);
            } else {
              onAddLiveStream(st);
            }
            setLiveStreamModalOpen(false);
            setEditingLiveStream(null);
          }}
        />
      )}

      {/* MODAL: MEDIA UPLOAD */}
      {mediaUploadOpen && (
        <MediaUploadModal
          isOpen={mediaUploadOpen}
          onClose={() => setMediaUploadOpen(false)}
          onSave={(media) => {
            onAddMediaFile(media);
            setMediaUploadOpen(false);
          }}
        />
      )}

      {/* MODAL: IN-APP DELETE CONFIRMATION (PREVENTS IFRAME BLOCKING) */}
      {deleteConfirm?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{deleteConfirm.title}</h3>
                <p className="text-xs text-zinc-400">{deleteConfirm.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Form Modals helper definitions
function MovieFormModal({
  isOpen,
  movie,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
  onSave: (m: Movie) => void;
}) {
  const [title, setTitle] = useState(movie?.title || '');
  const [poster, setPoster] = useState(movie?.poster || '');
  const [videoUrl, setVideoUrl] = useState(movie?.videoUrl || '');
  const [genres, setGenres] = useState(movie ? movie.genre.join(', ') : 'Action, Thriller');
  const [duration, setDuration] = useState(movie?.duration || 150);
  const [year, setYear] = useState(movie?.releaseYear || 2024);
  const [director, setDirector] = useState(movie?.director || '');
  const [cast, setCast] = useState(movie ? movie.cast.join(', ') : '');
  const [description, setDescription] = useState(movie?.description || '');
  const [isPremium, setIsPremium] = useState(movie?.isPremium || false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <h3 className="font-bold text-white text-base">
            {movie ? 'Edit Movie' : 'Add New Movie'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const mov: Movie = {
              id: movie ? movie.id : `movie_${Date.now()}`,
              title,
              slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              poster: poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
              thumbnail: poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
              backdrop: poster,
              description,
              genre: genres.split(',').map((g) => g.trim()),
              language: 'Tamil',
              releaseYear: Number(year),
              ageRating: 'U/A 16+',
              cast: cast ? cast.split(',').map((c) => c.trim()) : ['Superstar Cast'],
              director: director || 'Director',
              duration: Number(duration),
              videoUrl: videoUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              isFeatured: true,
              isTrending: true,
              status: 'published',
              isPremium,
              publishDate: new Date().toISOString().split('T')[0],
              views: movie?.views || 1000,
              rating: movie?.rating || 8.5,
            };
            onSave(mov);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Movie Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leo: Bloody Sweet"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Video Stream URL (HLS / m3u8)</label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://.../master.m3u8"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Duration (Mins)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Release Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Poster Image URL</label>
            <input
              type="url"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Genres (comma separated)</label>
            <input
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Action, Thriller, Drama"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Synopsis & Storyline</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500"
            />
            <span className="text-zinc-300 font-medium">VIP Premium Exclusive</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-zinc-950"
            >
              Save Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LiveStreamFormModal({
  isOpen,
  stream,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  stream: LiveStream | null;
  onClose: () => void;
  onSave: (st: LiveStream) => void;
}) {
  const [title, setTitle] = useState(stream?.title || '');
  const [streamUrl, setStreamUrl] = useState(stream?.streamUrl || '');
  const [category, setCategory] = useState(stream?.category || 'News');
  const [status, setStatus] = useState<LiveStream['status']>(stream?.status || 'live');
  const [thumbnail, setThumbnail] = useState(stream?.thumbnail || '');
  const [description, setDescription] = useState(stream?.description || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <h3 className="font-bold text-white text-base">
            {stream ? 'Edit Live Stream' : 'Create Live Broadcast'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const st: LiveStream = {
              id: stream ? stream.id : `live_${Date.now()}`,
              title,
              description,
              thumbnail: thumbnail || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
              streamUrl,
              status,
              language: 'Tamil',
              category,
              isFeatured: true,
              isPublished: true,
              viewsCount: stream?.viewsCount || 500,
            };
            onSave(st);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Broadcast Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tamil Cinema Awards Live"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Stream URL (HLS / m3u8)</label>
            <input
              type="url"
              required
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://.../live.m3u8"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="News, Sports, Music"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LiveStream['status'])}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              >
                <option value="live">Live (Broadcasting)</option>
                <option value="scheduled">Scheduled</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Poster Thumbnail URL</label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-zinc-950"
            >
              Save Live Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MediaUploadModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (m: MediaFile) => void;
}) {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [type, setType] = useState<MediaFile['type']>('poster');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <h3 className="font-bold text-white text-base">Add Media Asset</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const media: MediaFile = {
              id: `media_${Date.now()}`,
              fileName: fileName.trim() || 'asset_image.jpg',
              fileUrl: fileUrl.trim(),
              type,
              size: 512000,
              uploadedAt: Date.now(),
            };
            onSave(media);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Asset Name</label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. jailer_poster_hd.jpg"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Image URL</label>
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Media Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MediaFile['type'])}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
            >
              <option value="poster">Poster (Portrait)</option>
              <option value="banner">Banner (Backdrop)</option>
              <option value="thumbnail">Thumbnail (Landscape)</option>
              <option value="logo">Channel / Brand Logo</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 font-bold text-zinc-950"
            >
              Add to Media Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
