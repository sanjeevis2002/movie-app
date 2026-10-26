import { Channel, AdminSettings, RecentItem } from '../types/iptv';
import { DEFAULT_TAMIL_PLAYLIST_URL } from './m3uParser';

const STORAGE_KEYS = {
  CHANNELS: 'tamil_iptv_channels_v1',
  FAVORITES: 'tamil_iptv_favorites_v1',
  RECENTS: 'tamil_iptv_recents_v1',
  SETTINGS: 'tamil_iptv_settings_v1',
};

const DEFAULT_SETTINGS: AdminSettings = {
  playlistUrl: DEFAULT_TAMIL_PLAYLIST_URL,
  lastImportTime: null,
  autoRefreshOnLoad: false,
  importLogs: [],
};

export function getStoredChannels(): Channel[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredChannels(channels: Channel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  } catch (e) {
    console.error('Failed to save channels to localStorage', e);
  }
}

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

export function toggleFavoriteInStorage(channelId: string): string[] {
  const current = getFavorites();
  const exists = current.includes(channelId);
  const next = exists ? current.filter(id => id !== channelId) : [...current, channelId];
  saveFavorites(next);
  return next;
}

export function getRecentChannels(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRecentChannel(channelId: string): RecentItem[] {
  try {
    const current = getRecentChannels().filter(item => item.channelId !== channelId);
    const updated: RecentItem[] = [{ channelId, lastWatched: Date.now() }, ...current].slice(0, 16);
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentChannels(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENTS);
  } catch (e) {
    console.error(e);
  }
}

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  try {
    const current = getAdminSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
