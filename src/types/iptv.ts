export interface Channel {
  id: string;
  name: string;
  cleanName: string;
  resolution?: string;
  logo: string;
  group: string;
  url: string;
  tvgId?: string;
  httpReferrer?: string;
  enabled: boolean;
  isFavorite?: boolean;
  isFeatured?: boolean;
  isCustom?: boolean;
  addedAt?: number;
}

export type PlaybackStatus = 'idle' | 'loading' | 'verified_live' | 'buffering' | 'error' | 'offline';

export interface ImportLog {
  timestamp: number;
  url: string;
  totalParsed: number;
  validChannels: number;
  errors: string[];
}

export interface AdminSettings {
  playlistUrl: string;
  lastImportTime: number | null;
  autoRefreshOnLoad: boolean;
  importLogs: ImportLog[];
}

export interface RecentItem {
  channelId: string;
  lastWatched: number;
}
