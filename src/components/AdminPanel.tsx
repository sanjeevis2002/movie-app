import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  PlayCircle,
  Star,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tv,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Channel, AdminSettings } from '../types/iptv';
import { testStreamSafetyAndReachability, StreamTestResult } from '../services/streamTester';
import { DEFAULT_TAMIL_PLAYLIST_URL, validateSafeUrl } from '../services/m3uParser';

interface AdminPanelProps {
  channels: Channel[];
  settings: AdminSettings;
  onAddChannel: () => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
  onToggleEnabled: (channelId: string) => void;
  onToggleFeatured: (channelId: string) => void;
  onToggleFavorite: (channelId: string) => void;
  onImportPlaylist: (url: string) => Promise<void>;
  onResetToDefault: () => void;
  onPlayChannel: (channel: Channel) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  channels,
  settings,
  onAddChannel,
  onEditChannel,
  onDeleteChannel,
  onToggleEnabled,
  onToggleFeatured,
  onToggleFavorite,
  onImportPlaylist,
  onResetToDefault,
  onPlayChannel,
}) => {
  const [importUrl, setImportUrl] = useState(settings.playlistUrl || DEFAULT_TAMIL_PLAYLIST_URL);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search and filter inside admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('all');

  // Stream tester state
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, StreamTestResult>>({});

  // Deletion confirmation state
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  // Unique categories for filter
  const categories = Array.from(new Set(channels.map((c) => c.group || 'Tamil'))).filter(Boolean);

  const filteredChannels = channels.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      c.url.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (c.group && c.group.toLowerCase().includes(adminSearch.toLowerCase()));
    const matchesCat = adminCategory === 'all' || (c.group && c.group.toLowerCase() === adminCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    const safeCheck = validateSafeUrl(importUrl.trim());
    if (!safeCheck.safe) {
      setImportStatus({
        type: 'error',
        message: safeCheck.reason || 'Invalid or forbidden URL.',
      });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      await onImportPlaylist(importUrl.trim());
      setImportStatus({
        type: 'success',
        message: 'IPTV Playlist imported and synchronized successfully!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import playlist.';
      setImportStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleTestStream = async (channel: Channel) => {
    setTestingChannelId(channel.id);
    try {
      const result = await testStreamSafetyAndReachability(channel.url);
      setTestResults((prev) => ({ ...prev, [channel.id]: result }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [channel.id]: { success: false, message: 'Stream probe failed' },
      }));
    } finally {
      setTestingChannelId(null);
    }
  };

  const activeCount = channels.filter((c) => c.enabled !== false).length;
  const disabledCount = channels.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header section with Stats */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">IPTV Channel Management</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Manage live Tamil stream sources, test connectivity, import M3U playlists, and toggle channel visibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddChannel}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Channel Manually</span>
            </button>
            <button
              onClick={onResetToDefault}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to default official Tamil IPTV list"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <p className="text-xs text-zinc-400 mb-1">Total Channels</p>
            <p className="text-2xl font-bold text-white">{channels.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <p className="text-xs text-zinc-400 mb-1">Active / Enabled</p>
            <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <p className="text-xs text-zinc-400 mb-1">Disabled Channels</p>
            <p className="text-2xl font-bold text-zinc-400">{disabledCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <p className="text-xs text-zinc-400 mb-1">Last Sync</p>
            <p className="text-xs font-medium text-amber-300 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {settings.lastImportTime ? new Date(settings.lastImportTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Initial Load'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Import / Synchronize Playlist Box */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-amber-400" />
          <span>Import Channels from M3U URL</span>
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Provide any valid M3U or M3U8 playlist URL. Public repositories with CORS or HLS feeds will be parsed and merged.
        </p>

        <form onSubmit={handleImportSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="url"
            required
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://.../playlist.m3u"
            className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
          />
          <button
            type="submit"
            disabled={isImporting}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isImporting ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isImporting ? 'Parsing Playlist...' : 'Import & Sync'}</span>
          </button>
        </form>

        {importStatus && (
          <div
            className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Import Logs if available */}
        {settings.importLogs && settings.importLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <details className="text-xs text-zinc-400 group">
              <summary className="cursor-pointer font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 select-none">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>View Recent Import Logs ({settings.importLogs.length})</span>
              </summary>
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                {settings.importLogs.slice(0, 3).map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="text-emerald-400 font-semibold">{log.validChannels} channels imported</span>
                    </div>
                    <p className="text-zinc-500 truncate">{log.url || 'Default Tamil Source'}</p>
                    {log.errors.length > 0 && (
                      <p className="text-amber-400/80 text-[10px] mt-1">Warnings: {log.errors.join('; ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Filter and Channel List Section */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {/* Table controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Filter channels..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={adminCategory}
              onChange={(e) => setAdminCategory(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stream URL & Diagnostics</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredChannels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No channels match your search filter.
                  </td>
                </tr>
              ) : (
                filteredChannels.slice(0, 100).map((channel) => {
                  const isTesting = testingChannelId === channel.id;
                  const testRes = testResults[channel.id];

                  return (
                    <tr
                      key={channel.id}
                      className={`hover:bg-zinc-850/50 transition-colors ${
                        channel.enabled === false ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Logo and Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
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
                              <Tv className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-200 truncate max-w-[180px]">
                              {channel.cleanName || channel.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                              {channel.resolution && (
                                <span className="font-mono text-amber-400/90">{channel.resolution}</span>
                              )}
                              {channel.isCustom && (
                                <span className="text-cyan-400 font-medium">Custom</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-zinc-300">
                        <span>{channel.group || 'Tamil'}</span>
                      </td>

                      {/* Stream URL & Test Result */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 truncate">
                            <span className="truncate">{channel.url}</span>
                            <a
                              href={channel.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-500 hover:text-zinc-300 shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Test result message if available */}
                          {testRes && (
                            <div
                              className={`text-[10px] flex items-center gap-1 ${
                                testRes.success ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {testRes.success ? (
                                <CheckCircle className="w-3 h-3 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                              )}
                              <span className="truncate">
                                {testRes.message} {testRes.latencyMs ? `(${testRes.latencyMs}ms)` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Enable / Disable Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleEnabled(channel.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            channel.enabled !== false
                              ? 'text-emerald-400 hover:bg-emerald-950/40'
                              : 'text-zinc-600 hover:bg-zinc-800'
                          }`}
                          title={channel.enabled !== false ? 'Enabled: Click to disable' : 'Disabled: Click to enable'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Play in viewer */}
                          <button
                            onClick={() => onPlayChannel(channel)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                            title="Play channel in player"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>

                          {/* Test Stream Probe */}
                          <button
                            onClick={() => handleTestStream(channel)}
                            disabled={isTesting}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Safe playback check"
                          >
                            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
                          </button>

                          {/* Toggle Favorite */}
                          <button
                            onClick={() => onToggleFavorite(channel.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              channel.isFavorite
                                ? 'text-amber-400 hover:bg-amber-950/40'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                            }`}
                            title="Toggle favorite status"
                          >
                            <Star className={`w-4 h-4 ${channel.isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* Toggle Featured */}
                          <button
                            onClick={() => onToggleFeatured(channel.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              channel.isFeatured
                                ? 'text-purple-400 hover:bg-purple-950/40'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                            }`}
                            title="Toggle featured status"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditChannel(channel)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Edit channel details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setChannelToDelete(channel)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Delete channel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredChannels.length > 100 && (
          <div className="p-3 bg-zinc-950/60 border-t border-zinc-800 text-center text-xs text-zinc-500">
            Showing first 100 of {filteredChannels.length} channels. Use search above to find specific channels.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {channelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Delete Channel?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5">
              Are you sure you want to permanently remove <strong className="text-white">{channelToDelete.name}</strong> from your channel list? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setChannelToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteChannel(channelToDelete.id);
                  setChannelToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Delete Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
