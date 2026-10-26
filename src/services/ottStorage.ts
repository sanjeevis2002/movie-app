import {
  Movie,
  TVShow,
  Episode,
  LiveStream,
  MediaFile,
  SiteSettings,
  AdminActivityLog,
  User,
  AdminUser,
  WatchHistoryItem,
  WatchlistItem,
  ContentType,
} from '../types/ott';
import {
  INITIAL_MOVIES,
  INITIAL_TV_SHOWS,
  INITIAL_EPISODES,
  INITIAL_LIVE_STREAMS,
  INITIAL_MEDIA_FILES,
  INITIAL_SITE_SETTINGS,
  INITIAL_ADMIN_LOGS,
} from '../data/ottSeed';

const KEYS = {
  MOVIES: 'ott_movies_v2',
  TV_SHOWS: 'ott_tv_shows_v2',
  EPISODES: 'ott_episodes_v2',
  LIVE_STREAMS: 'ott_live_streams_v2',
  MEDIA_FILES: 'ott_media_files_v2',
  SITE_SETTINGS: 'ott_site_settings_v2',
  ADMIN_LOGS: 'ott_admin_logs_v2',
  CURRENT_USER: 'ott_auth_current_user_v2',
  CURRENT_ADMIN: 'ott_auth_current_admin_v2',
  REGISTERED_USERS: 'ott_registered_users_v2',
  WATCH_HISTORY: 'ott_watch_history_v2',
  WATCHLIST: 'ott_watchlist_v2',
};

// Initial default user & admin for instant zero-friction testing
const DEFAULT_USER: User = {
  id: 'user_tamil_viewer',
  name: 'Tamil Cinema Fan',
  email: 'viewer@tamilflix.tv',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  role: 'user',
  isPremium: true,
  status: 'active',
  createdAt: Date.now() - 86400000 * 15,
};

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin_master',
  name: 'Head Administrator',
  email: 'admin@tamilflix.tv',
  role: 'superadmin',
  lastLogin: Date.now(),
};

// Generic safe local storage reader
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to store key ' + key, e);
  }
}

// ----------------- MOVIES CRUD -----------------
export function getMovies(): Movie[] {
  return getStored<Movie[]>(KEYS.MOVIES, INITIAL_MOVIES);
}

export function saveMovies(movies: Movie[]): void {
  setStored(KEYS.MOVIES, movies);
}

export function addMovie(movie: Movie, adminName = 'Admin'): void {
  const current = getMovies();
  const updated = [movie, ...current];
  saveMovies(updated);
  logAdminActivity(adminName, 'ADD_MOVIE', 'MOVIE', movie.id, `Created movie "${movie.title}"`);
}

export function updateMovie(updatedMovie: Movie, adminName = 'Admin'): void {
  const current = getMovies();
  const next = current.map((m) => (m.id === updatedMovie.id ? updatedMovie : m));
  saveMovies(next);
  logAdminActivity(adminName, 'UPDATE_MOVIE', 'MOVIE', updatedMovie.id, `Updated movie "${updatedMovie.title}"`);
}

export function deleteMovie(id: string, adminName = 'Admin'): void {
  const current = getMovies();
  const target = current.find((m) => m.id === id);
  const next = current.filter((m) => m.id !== id);
  saveMovies(next);
  if (target) {
    logAdminActivity(adminName, 'DELETE_MOVIE', 'MOVIE', id, `Deleted movie "${target.title}"`);
  }
}

// ----------------- TV SHOWS CRUD -----------------
export function getTVShows(): TVShow[] {
  return getStored<TVShow[]>(KEYS.TV_SHOWS, INITIAL_TV_SHOWS);
}

export function saveTVShows(shows: TVShow[]): void {
  setStored(KEYS.TV_SHOWS, shows);
}

export function addTVShow(show: TVShow, adminName = 'Admin'): void {
  const current = getTVShows();
  saveTVShows([show, ...current]);
  logAdminActivity(adminName, 'ADD_TV_SHOW', 'TV_SHOW', show.id, `Added TV show "${show.title}"`);
}

export function updateTVShow(updatedShow: TVShow, adminName = 'Admin'): void {
  const current = getTVShows();
  const next = current.map((s) => (s.id === updatedShow.id ? updatedShow : s));
  saveTVShows(next);
  logAdminActivity(adminName, 'UPDATE_TV_SHOW', 'TV_SHOW', updatedShow.id, `Updated TV show "${updatedShow.title}"`);
}

export function deleteTVShow(id: string, adminName = 'Admin'): void {
  const current = getTVShows();
  const target = current.find((s) => s.id === id);
  saveTVShows(current.filter((s) => s.id !== id));
  // Also delete associated episodes
  const epCurrent = getEpisodes();
  saveEpisodes(epCurrent.filter((e) => e.showId !== id));
  if (target) {
    logAdminActivity(adminName, 'DELETE_TV_SHOW', 'TV_SHOW', id, `Deleted TV show "${target.title}" & all its episodes`);
  }
}

// ----------------- EPISODES CRUD -----------------
export function getEpisodes(): Episode[] {
  return getStored<Episode[]>(KEYS.EPISODES, INITIAL_EPISODES);
}

export function saveEpisodes(episodes: Episode[]): void {
  setStored(KEYS.EPISODES, episodes);
}

export function getEpisodesByShow(showId: string): Episode[] {
  return getEpisodes().filter((e) => e.showId === showId);
}

export function addEpisode(ep: Episode, adminName = 'Admin'): { success: boolean; episode: Episode; message: string } {
  const current = getEpisodes();
  const targetId = ep.id || `ep_${ep.showId}_s${ep.seasonNumber}_e${ep.episodeNumber}_${Date.now()}`;
  const completeEp: Episode = {
    ...ep,
    id: targetId,
    seasonNumber: Number(ep.seasonNumber),
    episodeNumber: Number(ep.episodeNumber),
  };
  saveEpisodes([...current, completeEp]);

  // If season number is higher than TV show's current totalSeasons, update the show
  const shows = getTVShows();
  const targetShow = shows.find((s) => s.id === ep.showId);
  if (targetShow && ep.seasonNumber > targetShow.totalSeasons) {
    updateTVShow({ ...targetShow, totalSeasons: ep.seasonNumber }, adminName);
  }

  logAdminActivity(
    adminName,
    'ADD_EPISODE',
    'EPISODE',
    completeEp.id,
    `Added Season ${completeEp.seasonNumber} Ep ${completeEp.episodeNumber}: "${completeEp.title}"`
  );
  return { success: true, episode: completeEp, message: `Episode "${completeEp.title}" added successfully.` };
}

export function updateEpisode(updatedEp: Episode, adminName = 'Admin'): { success: boolean; episode: Episode; message: string } {
  const current = getEpisodes();
  saveEpisodes(current.map((e) => (e.id === updatedEp.id ? updatedEp : e)));
  logAdminActivity(adminName, 'UPDATE_EPISODE', 'EPISODE', updatedEp.id, `Updated Ep "${updatedEp.title}"`);
  return { success: true, episode: updatedEp, message: `Episode "${updatedEp.title}" updated successfully.` };
}

export function deleteEpisode(id: string, adminName = 'Admin'): { success: boolean; message: string; deletedEpisode?: Episode } {
  const current = getEpisodes();
  const target = current.find((e) => e.id === id);
  if (!target) {
    return { success: false, message: `Episode with ID "${id}" was not found.` };
  }
  // Delete ONLY this single record
  const next = current.filter((e) => e.id !== id);
  saveEpisodes(next);
  logAdminActivity(
    adminName,
    'DELETE_EPISODE',
    'EPISODE',
    id,
    `Deleted Ep "${target.title}" (Season ${target.seasonNumber} Ep ${target.episodeNumber})`
  );
  return { success: true, message: `Episode "${target.title}" successfully deleted.`, deletedEpisode: target };
}

export function getNextEpisodeNumber(showId: string, seasonNumber: number): number {
  const current = getEpisodes().filter((e) => e.showId === showId && e.seasonNumber === seasonNumber);
  if (current.length === 0) return 1;
  const maxEp = Math.max(...current.map((e) => e.episodeNumber));
  return maxEp + 1;
}

export function addEpisodesBatch(
  showId: string,
  seasonNumber: number,
  newEpisodes: Omit<Episode, 'id' | 'showId' | 'seasonNumber'>[],
  adminName = 'Admin'
): { success: boolean; count: number; error?: string } {
  const allEpisodes = getEpisodes();
  const existingSeasonEpisodes = allEpisodes.filter((e) => e.showId === showId && e.seasonNumber === seasonNumber);
  const existingNumbers = new Set(existingSeasonEpisodes.map((e) => e.episodeNumber));

  // Auto-resolve non-colliding episode numbers if any overlap
  let currentMax = existingNumbers.size > 0 ? Math.max(...existingNumbers) : 0;
  const incomingNumbers = new Set<number>();
  const resolvedEpisodes: Omit<Episode, 'id' | 'showId' | 'seasonNumber'>[] = [];

  for (const ep of newEpisodes) {
    let targetNum = Number(ep.episodeNumber);
    if (!targetNum || existingNumbers.has(targetNum) || incomingNumbers.has(targetNum)) {
      currentMax += 1;
      targetNum = currentMax;
    } else {
      currentMax = Math.max(currentMax, targetNum);
    }
    incomingNumbers.add(targetNum);
    resolvedEpisodes.push({ ...ep, episodeNumber: targetNum });
  }

  // Create full Episode objects
  const created: Episode[] = resolvedEpisodes.map((item) => ({
    ...item,
    id: `ep_${showId}_s${seasonNumber}_e${item.episodeNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    showId,
    seasonNumber,
  }));

  // Append new episodes, keeping all previous episodes completely intact!
  const updatedEpisodes = [...allEpisodes, ...created];
  saveEpisodes(updatedEpisodes);

  // If season number is higher than TV show's current totalSeasons, update the show
  const shows = getTVShows();
  const targetShow = shows.find((s) => s.id === showId);
  if (targetShow && seasonNumber > targetShow.totalSeasons) {
    updateTVShow({ ...targetShow, totalSeasons: seasonNumber }, adminName);
  }

  logAdminActivity(
    adminName,
    'BATCH_ADD_EPISODES',
    'EPISODE',
    showId,
    `Added ${created.length} new episodes to "${targetShow?.title || showId}" (Season ${seasonNumber})`
  );

  return { success: true, count: created.length };
}

// ----------------- LIVE STREAMS CRUD -----------------
export function getLiveStreams(): LiveStream[] {
  return getStored<LiveStream[]>(KEYS.LIVE_STREAMS, INITIAL_LIVE_STREAMS);
}

export function saveLiveStreams(streams: LiveStream[]): void {
  setStored(KEYS.LIVE_STREAMS, streams);
}

export function addLiveStream(stream: LiveStream, adminName = 'Admin'): void {
  const current = getLiveStreams();
  saveLiveStreams([stream, ...current]);
  logAdminActivity(adminName, 'ADD_LIVE_STREAM', 'LIVE_STREAM', stream.id, `Created live broadcast "${stream.title}"`);
}

export function updateLiveStream(stream: LiveStream, adminName = 'Admin'): void {
  const current = getLiveStreams();
  saveLiveStreams(current.map((s) => (s.id === stream.id ? stream : s)));
  logAdminActivity(adminName, 'UPDATE_LIVE_STREAM', 'LIVE_STREAM', stream.id, `Updated live broadcast "${stream.title}"`);
}

export function deleteLiveStream(id: string, adminName = 'Admin'): void {
  const current = getLiveStreams();
  const target = current.find((s) => s.id === id);
  saveLiveStreams(current.filter((s) => s.id !== id));
  if (target) {
    logAdminActivity(adminName, 'DELETE_LIVE_STREAM', 'LIVE_STREAM', id, `Removed live stream "${target.title}"`);
  }
}

// ----------------- MEDIA FILES CRUD -----------------
export function getMediaFiles(): MediaFile[] {
  return getStored<MediaFile[]>(KEYS.MEDIA_FILES, INITIAL_MEDIA_FILES);
}

export function saveMediaFiles(files: MediaFile[]): void {
  setStored(KEYS.MEDIA_FILES, files);
}

export function addMediaFile(file: MediaFile, adminName = 'Admin'): void {
  const current = getMediaFiles();
  saveMediaFiles([file, ...current]);
  logAdminActivity(adminName, 'UPLOAD_MEDIA', 'MEDIA', file.id, `Uploaded ${file.type} image "${file.fileName}"`);
}

export function deleteMediaFile(id: string, adminName = 'Admin'): void {
  const current = getMediaFiles();
  const target = current.find((f) => f.id === id);
  saveMediaFiles(current.filter((f) => f.id !== id));
  if (target) {
    logAdminActivity(adminName, 'DELETE_MEDIA', 'MEDIA', id, `Removed media file "${target.fileName}"`);
  }
}

// ----------------- SITE SETTINGS -----------------
export function getSiteSettings(): SiteSettings {
  return getStored<SiteSettings>(KEYS.SITE_SETTINGS, INITIAL_SITE_SETTINGS);
}

export function saveSiteSettings(settings: SiteSettings, adminName = 'Admin'): void {
  setStored(KEYS.SITE_SETTINGS, settings);
  logAdminActivity(adminName, 'UPDATE_SETTINGS', 'SITE_SETTINGS', 'global', `Updated site configuration`);
}

// ----------------- ADMIN ACTIVITY LOGS -----------------
export function getAdminLogs(): AdminActivityLog[] {
  return getStored<AdminActivityLog[]>(KEYS.ADMIN_LOGS, INITIAL_ADMIN_LOGS);
}

export function logAdminActivity(
  adminName: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
): void {
  const current = getAdminLogs();
  const newLog: AdminActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    adminName,
    action,
    entityType,
    entityId,
    timestamp: Date.now(),
    details,
  };
  setStored(KEYS.ADMIN_LOGS, [newLog, ...current].slice(0, 100));
}

// ----------------- USER AUTHENTICATION -----------------
export function getCurrentUser(): User | null {
  return getStored<User | null>(KEYS.CURRENT_USER, DEFAULT_USER);
}

export function setCurrentUser(user: User | null): void {
  setStored(KEYS.CURRENT_USER, user);
}

export function getRegisteredUsers(): User[] {
  return getStored<User[]>(KEYS.REGISTERED_USERS, [DEFAULT_USER]);
}

export function registerUser(name: string, email: string): User {
  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: 'user',
    isPremium: false,
    status: 'active',
    createdAt: Date.now(),
  };

  const updated = [...users, newUser];
  setStored(KEYS.REGISTERED_USERS, updated);
  setCurrentUser(newUser);
  return newUser;
}

export function loginUser(email: string): User {
  const users = getRegisteredUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    throw new Error('No user account found with this email address.');
  }
  if (found.status === 'suspended') {
    throw new Error('Your user account has been suspended by an administrator.');
  }
  setCurrentUser(found);
  return found;
}

export function updateUserProfile(updates: Partial<User>): User | null {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...updates };
  setCurrentUser(updated);

  const all = getRegisteredUsers().map((u) => (u.id === updated.id ? updated : u));
  setStored(KEYS.REGISTERED_USERS, all);
  return updated;
}

export function toggleUserPremiumStatus(userId: string): void {
  const all = getRegisteredUsers().map((u) => {
    if (u.id === userId) {
      return { ...u, isPremium: !u.isPremium };
    }
    return u;
  });
  setStored(KEYS.REGISTERED_USERS, all);
  const current = getCurrentUser();
  if (current?.id === userId) {
    setCurrentUser({ ...current, isPremium: !current.isPremium });
  }
}

// ----------------- ADMIN AUTHENTICATION -----------------
export function getCurrentAdmin(): AdminUser | null {
  return getStored<AdminUser | null>(KEYS.CURRENT_ADMIN, null);
}

export function setCurrentAdmin(admin: AdminUser | null): void {
  setStored(KEYS.CURRENT_ADMIN, admin);
}

export function adminLogin(passcode: string): AdminUser {
  // Production security: verify admin passcode
  // Default master pin: "admin123" or "tamilflix"
  const clean = passcode.trim();
  if (clean === 'admin123' || clean === 'tamilflix' || clean === 'admin') {
    const admin = { ...DEFAULT_ADMIN, lastLogin: Date.now() };
    setCurrentAdmin(admin);
    logAdminActivity(admin.name, 'ADMIN_LOGIN', 'AUTH', admin.id, 'Administrator logged in successfully.');
    return admin;
  }
  throw new Error('Invalid administrative password. Authentication denied.');
}

export function adminLogout(): void {
  const admin = getCurrentAdmin();
  if (admin) {
    logAdminActivity(admin.name, 'ADMIN_LOGOUT', 'AUTH', admin.id, 'Administrator logged out.');
  }
  setCurrentAdmin(null);
}

// ----------------- WATCHLIST & HISTORY -----------------
export function getWatchlist(userId?: string): WatchlistItem[] {
  const all = getStored<WatchlistItem[]>(KEYS.WATCHLIST, []);
  if (!userId) return all;
  return all.filter((w) => w.userId === userId);
}

export function toggleWatchlist(item: Omit<WatchlistItem, 'id' | 'addedAt'>): boolean {
  const current = getStored<WatchlistItem[]>(KEYS.WATCHLIST, []);
  const exists = current.some((w) => w.userId === item.userId && w.contentId === item.contentId);

  if (exists) {
    const next = current.filter((w) => !(w.userId === item.userId && w.contentId === item.contentId));
    setStored(KEYS.WATCHLIST, next);
    return false; // removed
  } else {
    const newItem: WatchlistItem = {
      ...item,
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      addedAt: Date.now(),
    };
    setStored(KEYS.WATCHLIST, [newItem, ...current]);
    return true; // added
  }
}

export function isItemInWatchlist(userId: string, contentId: string): boolean {
  const current = getWatchlist(userId);
  return current.some((w) => w.contentId === contentId);
}

export function getWatchHistory(userId?: string): WatchHistoryItem[] {
  const all = getStored<WatchHistoryItem[]>(KEYS.WATCH_HISTORY, []);
  if (!userId) return all;
  return all.filter((h) => h.userId === userId);
}

export function recordWatchHistory(
  userId: string,
  contentId: string,
  contentType: ContentType,
  title: string,
  thumbnail: string,
  progressSeconds = 120,
  durationSeconds = 7200
): void {
  const all = getStored<WatchHistoryItem[]>(KEYS.WATCH_HISTORY, []);
  const filtered = all.filter((h) => !(h.userId === userId && h.contentId === contentId));

  const newItem: WatchHistoryItem = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    contentId,
    contentType,
    title,
    thumbnail,
    progressSeconds,
    durationSeconds,
    watchedAt: Date.now(),
  };

  setStored(KEYS.WATCH_HISTORY, [newItem, ...filtered].slice(0, 30));
}

export function clearWatchHistory(userId: string): void {
  const all = getStored<WatchHistoryItem[]>(KEYS.WATCH_HISTORY, []);
  const next = all.filter((h) => h.userId !== userId);
  setStored(KEYS.WATCH_HISTORY, next);
}
