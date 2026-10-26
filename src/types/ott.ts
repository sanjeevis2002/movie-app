export type ContentType = 'movie' | 'tvshow' | 'episode' | 'channel' | 'livestream';

export interface Movie {
  id: string;
  title: string;
  slug: string;
  poster: string;
  thumbnail: string;
  backdrop?: string;
  description: string;
  synopsis?: string;
  genre: string[];
  language: string;
  releaseYear: number;
  ageRating: string;
  cast: string[];
  director: string;
  duration: number; // in minutes
  videoUrl: string;
  subtitles?: { lang: string; url: string; label: string }[];
  isFeatured: boolean;
  isTrending: boolean;
  status: 'draft' | 'published' | 'unlisted';
  isPremium: boolean;
  publishDate: string;
  views: number;
  rating: number; // e.g. 8.5
}

export interface TVShow {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster: string;
  banner: string;
  language: string;
  genre: string[];
  releaseYear: number;
  status: 'draft' | 'published' | 'unlisted';
  isFeatured: boolean;
  isPremium: boolean;
  rating: number;
  totalSeasons: number;
}

export interface Episode {
  id: string;
  showId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number; // in minutes
  releaseDate: string;
  subtitles?: { lang: string; url: string; label: string }[];
  status: 'draft' | 'published' | 'unlisted';
}

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  streamUrl: string;
  hlsUrl?: string;
  status: 'live' | 'offline' | 'scheduled' | 'disabled';
  scheduledStartTime?: string;
  language: string;
  category: string;
  isFeatured: boolean;
  isPublished: boolean;
  viewsCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'superadmin';
  isPremium: boolean;
  status: 'active' | 'suspended';
  createdAt: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'editor' | 'moderator';
  lastLogin?: number;
}

export interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  type: 'poster' | 'banner' | 'thumbnail' | 'logo' | 'avatar';
  size: number; // bytes
  uploadedAt: number;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  thumbnail: string;
  progressSeconds: number;
  durationSeconds: number;
  watchedAt: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  poster: string;
  rating?: number;
  releaseYear?: number;
  category?: string;
  addedAt: number;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  defaultM3uUrl: string;
  featuredHeroBannerId: string;
}

export interface AdminActivityLog {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: number;
  details: string;
}

export interface OTTState {
  movies: Movie[];
  tvShows: TVShow[];
  episodes: Episode[];
  liveStreams: LiveStream[];
  mediaFiles: MediaFile[];
  siteSettings: SiteSettings;
  adminLogs: AdminActivityLog[];
}
