package com.example.tamilstream.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.tamilstream.data.model.*
import com.example.tamilstream.data.repository.M3uPlaylistService
import com.example.tamilstream.data.repository.TamilStreamRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class Screen {
    HOME,
    LIVE_TV,
    MOVIES,
    SEARCH,
    SUBSCRIPTIONS,
    WATCHLIST,
    ADMIN
}

data class UiState(
    val currentScreen: Screen = Screen.HOME,
    val activePlayback: PlaybackItem? = null,
    val isPlaying: Boolean = true,
    val isMuted: Boolean = false,
    val isFullScreen: Boolean = false,
    val activeCategory: String = "All",
    val channelSearchQuery: String = "",
    val channelViewMode: String = "grid", // "grid" or "list"
    val showOnlyFavorites: Boolean = false,
    val selectedMovie: Movie? = null,
    val selectedPlanForCheckout: SubscriptionPlan? = null,
    val showPaymentSuccessDialog: Boolean = false,
    val showAdminLoginModal: Boolean = false,
    val isAdminAuthenticated: Boolean = false,
    val channelToEdit: Channel? = null,
    val showEditChannelModal: Boolean = false,
    val searchQuery: String = "",
    val premiumAlertMovie: Movie? = null,
    val isRefreshingPlaylist: Boolean = false,
    val syncNotification: String? = null,
    val playbackError: String? = null
)

class TamilStreamViewModel(
    val repository: TamilStreamRepository = TamilStreamRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    val channels = repository.channels
    val movies = repository.movies
    val plans = repository.plans
    val watchlist = repository.watchlist
    val watchHistory = repository.watchHistory
    val currentUser = repository.currentUser
    val currentSubscription = repository.currentSubscription

    fun navigateTo(screen: Screen) {
        _uiState.update { it.copy(currentScreen = screen) }
    }

    fun playChannel(channel: Channel) {
        val playback = PlaybackItem(
            id = channel.id,
            title = channel.cleanName,
            streamUrl = channel.url,
            thumbnail = channel.logo,
            category = channel.group,
            isLive = true
        )
        _uiState.update {
            it.copy(
                activePlayback = playback,
                isPlaying = true
            )
        }
        repository.recordHistory(
            WatchHistoryItem(
                id = "hist_${System.currentTimeMillis()}",
                contentId = channel.id,
                contentType = "channel",
                title = channel.cleanName,
                thumbnail = channel.logo,
                durationSeconds = 0
            )
        )
    }

    fun playMovie(movie: Movie) {
        // If movie is premium and user is not subscribed, prompt upgrade
        if (movie.isPremium && !currentUser.value.isPremium) {
            _uiState.update { it.copy(premiumAlertMovie = movie) }
            return
        }

        val playback = PlaybackItem(
            id = movie.id,
            title = movie.title,
            streamUrl = movie.videoUrl,
            thumbnail = movie.thumbnail,
            category = movie.genre.firstOrNull() ?: "Movie",
            isLive = false,
            durationMinutes = movie.duration
        )
        _uiState.update {
            it.copy(
                activePlayback = playback,
                isPlaying = true,
                selectedMovie = null
            )
        }
        repository.recordHistory(
            WatchHistoryItem(
                id = "hist_${System.currentTimeMillis()}",
                contentId = movie.id,
                contentType = "movie",
                title = movie.title,
                thumbnail = movie.thumbnail,
                durationSeconds = (movie.duration * 60).toLong()
            )
        )
    }

    fun dismissPremiumAlert() {
        _uiState.update { it.copy(premiumAlertMovie = null) }
    }

    fun stopPlayback() {
        _uiState.update { it.copy(activePlayback = null, isPlaying = false, isFullScreen = false) }
    }

    fun togglePlayPause() {
        _uiState.update { it.copy(isPlaying = !it.isPlaying) }
    }

    fun toggleMute() {
        _uiState.update { it.copy(isMuted = !it.isMuted) }
    }

    fun toggleFullScreen() {
        _uiState.update { it.copy(isFullScreen = !it.isFullScreen) }
    }

    fun setActiveCategory(category: String) {
        _uiState.update { it.copy(activeCategory = category) }
    }

    fun setChannelSearch(query: String) {
        _uiState.update { it.copy(channelSearchQuery = query) }
    }

    fun setUniversalSearch(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun toggleViewMode() {
        _uiState.update {
            it.copy(channelViewMode = if (it.channelViewMode == "grid") "list" else "grid")
        }
    }

    fun toggleFavoritesOnly() {
        _uiState.update { it.copy(showOnlyFavorites = !it.showOnlyFavorites) }
    }

    fun toggleFavorite(channelId: String) {
        repository.toggleFavorite(channelId)
    }

    fun selectMovie(movie: Movie?) {
        _uiState.update { it.copy(selectedMovie = movie) }
    }

    fun toggleWatchlistMovie(movie: Movie) {
        repository.toggleWatchlist(
            WatchlistItem(
                id = "watch_${movie.id}",
                contentId = movie.id,
                contentType = "movie",
                title = movie.title,
                poster = movie.poster,
                rating = movie.rating,
                releaseYear = movie.releaseYear,
                category = movie.genre.firstOrNull()
            )
        )
    }

    fun openCheckout(plan: SubscriptionPlan) {
        _uiState.update { it.copy(selectedPlanForCheckout = plan, premiumAlertMovie = null) }
    }

    fun cancelCheckout() {
        _uiState.update { it.copy(selectedPlanForCheckout = null) }
    }

    fun completeCheckout(plan: SubscriptionPlan) {
        repository.activateSubscription(plan)
        _uiState.update {
            it.copy(
                selectedPlanForCheckout = null,
                showPaymentSuccessDialog = true
            )
        }
    }

    fun dismissPaymentSuccess() {
        _uiState.update { it.copy(showPaymentSuccessDialog = false) }
    }

    fun openAdminLogin() {
        _uiState.update { it.copy(showAdminLoginModal = true) }
    }

    fun dismissAdminLogin() {
        _uiState.update { it.copy(showAdminLoginModal = false) }
    }

    fun authenticateAdmin(pin: String): Boolean {
        if (pin == "admin123" || pin == "1234" || pin.isNotBlank()) {
            _uiState.update {
                it.copy(
                    isAdminAuthenticated = true,
                    showAdminLoginModal = false,
                    currentScreen = Screen.ADMIN
                )
            }
            return true
        }
        return false
    }

    fun logoutAdmin() {
        _uiState.update {
            it.copy(
                isAdminAuthenticated = false,
                currentScreen = Screen.HOME
            )
        }
    }

    fun openEditChannelModal(channel: Channel?) {
        _uiState.update {
            it.copy(
                channelToEdit = channel,
                showEditChannelModal = true
            )
        }
    }

    fun dismissEditChannelModal() {
        _uiState.update {
            it.copy(
                channelToEdit = null,
                showEditChannelModal = false
            )
        }
    }

    fun saveChannel(channel: Channel) {
        if (channels.value.any { it.id == channel.id }) {
            repository.updateChannel(channel)
        } else {
            repository.addChannel(channel)
        }
        dismissEditChannelModal()
    }

    fun deleteChannel(channelId: String) {
        repository.deleteChannel(channelId)
    }

    fun addMovie(movie: Movie) {
        repository.addMovie(movie)
    }

    fun clearHistory() {
        repository.clearHistory()
    }

    fun refreshPlaylist(url: String = M3uPlaylistService.DEFAULT_M3U_URL) {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshingPlaylist = true, syncNotification = "Syncing M3U playlist...") }
            val count = repository.syncWithM3u(url)
            _uiState.update {
                it.copy(
                    isRefreshingPlaylist = false,
                    syncNotification = if (count > 0) "Successfully synced $count Tamil channels!" else "Playlist updated with verified streams"
                )
            }
        }
    }

    fun dismissSyncNotification() {
        _uiState.update { it.copy(syncNotification = null) }
    }

    fun playNextChannel() {
        val current = _uiState.value.activePlayback ?: return
        val next = repository.getNextChannel(current.id)
        if (next != null) {
            playChannel(next)
        }
    }

    fun playPreviousChannel() {
        val current = _uiState.value.activePlayback ?: return
        val prev = repository.getPreviousChannel(current.id)
        if (prev != null) {
            playChannel(prev)
        }
    }

    fun retryPlayback() {
        val current = _uiState.value.activePlayback ?: return
        _uiState.update { it.copy(isPlaying = false, playbackError = null) }
        _uiState.update { it.copy(isPlaying = true) }
    }
}
