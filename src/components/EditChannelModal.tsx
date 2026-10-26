import React, { useState, useEffect } from 'react';
import { X, Tv, Link, Folder, Image, Check, AlertCircle } from 'lucide-react';
import { Channel } from '../types/iptv';
import { validateSafeUrl, extractResolutionAndName } from '../services/m3uParser';

interface EditChannelModalProps {
  channel: Channel | null; // null means adding a new channel
  isOpen: boolean;
  onClose: () => void;
  onSave: (channel: Channel) => void;
  existingCategories: string[];
}

export const EditChannelModal: React.FC<EditChannelModalProps> = ({
  channel,
  isOpen,
  onClose,
  onSave,
  existingCategories,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [group, setGroup] = useState('Tamil');
  const [enabled, setEnabled] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channel) {
      setName(channel.name);
      setUrl(channel.url);
      setLogo(channel.logo || '');
      setGroup(channel.group || 'Tamil');
      setEnabled(channel.enabled !== false);
      setIsFeatured(!!channel.isFeatured);
    } else {
      setName('');
      setUrl('');
      setLogo('');
      setGroup(existingCategories[0] || 'Tamil');
      setEnabled(true);
      setIsFeatured(false);
    }
    setError(null);
  }, [channel, isOpen, existingCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a channel name.');
      return;
    }

    if (!url.trim()) {
      setError('Please provide a stream URL.');
      return;
    }

    const safeCheck = validateSafeUrl(url.trim());
    if (!safeCheck.safe) {
      setError(safeCheck.reason || 'Invalid stream URL.');
      return;
    }

    if (logo.trim()) {
      const logoSafe = validateSafeUrl(logo.trim());
      if (!logoSafe.safe) {
        setError('Invalid logo URL: must be an external HTTP or HTTPS link.');
        return;
      }
    }

    const { cleanName, resolution } = extractResolutionAndName(name.trim());

    const updatedChannel: Channel = {
      id: channel ? channel.id : `custom_${Date.now()}`,
      name: name.trim(),
      cleanName,
      resolution,
      url: url.trim(),
      logo: logo.trim(),
      group: group.trim() || 'Tamil',
      enabled,
      isFeatured,
      isFavorite: channel ? channel.isFavorite : false,
      isCustom: true,
      addedAt: channel?.addedAt || Date.now(),
    };

    onSave(updatedChannel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {channel ? 'Edit IPTV Channel' : 'Add New Tamil Channel'}
              </h3>
              <p className="text-xs text-zinc-400">
                Configure stream source, metadata, and homepage visibility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Channel Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sun TV (1080p) or Vijay TV"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Live Stream URL (HLS / m3u8) <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Link className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/live/master.m3u8"
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Supports HLS (.m3u8) streams from verified public broadcasters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Channel Logo URL (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Image className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://i.imgur.com/...png"
                  className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category / Group
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Folder className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  list="category-suggestions"
                  placeholder="e.g. Music, News, Movies"
                  className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <datalist id="category-suggestions">
                  {existingCategories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                  <option value="Entertainment" />
                  <option value="News" />
                  <option value="Music" />
                  <option value="Movies" />
                  <option value="Religious" />
                  <option value="Kids" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Visibility and Featured toggles */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-zinc-800/80">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-700"
              />
              <span className="text-xs text-zinc-300 font-medium">Channel Enabled & Visible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-700"
              />
              <span className="text-xs text-zinc-300 font-medium">Mark as Featured</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{channel ? 'Save Changes' : 'Add Channel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
