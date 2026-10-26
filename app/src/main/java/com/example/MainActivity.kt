package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.example.tamilstream.data.model.Channel
import com.example.tamilstream.data.model.Movie
import com.example.tamilstream.ui.components.*
import com.example.tamilstream.ui.screens.*
import com.example.tamilstream.ui.theme.*
import com.example.tamilstream.ui.viewmodel.Screen
import com.example.tamilstream.ui.viewmodel.TamilStreamViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: TamilStreamViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            TamilStreamTheme {
                val uiState by viewModel.uiState.collectAsState()
                val channels by viewModel.channels.collectAsState()
                val movies by viewModel.movies.collectAsState()
                val plans by viewModel.plans.collectAsState()
                val watchlist by viewModel.watchlist.collectAsState()
                val watchHistory by viewModel.watchHistory.collectAsState()
                val user by viewModel.currentUser.collectAsState()
                val sub by viewModel.currentSubscription.collectAsState()

                // Back navigation handling
                BackHandler(enabled = uiState.currentScreen != Screen.HOME || uiState.isFullScreen) {
                    if (uiState.isFullScreen) {
                        viewModel.toggleFullScreen()
                    } else if (uiState.currentScreen != Screen.HOME) {
                        viewModel.navigateTo(Screen.HOME)
                    }
                }

                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .testTag("app_root_surface"),
                    color = ObsidianBlack
                ) {
                    if (uiState.isFullScreen && uiState.activePlayback != null) {
                        // Fullscreen player mode
                        VideoPlayerView(
                            playbackItem = uiState.activePlayback!!,
                            isPlaying = uiState.isPlaying,
                            isMuted = uiState.isMuted,
                            isFullScreen = true,
                            onTogglePlay = { viewModel.togglePlayPause() },
                            onToggleMute = { viewModel.toggleMute() },
                            onToggleFullScreen = { viewModel.toggleFullScreen() },
                            onClose = { viewModel.stopPlayback() },
                            onNextChannel = { viewModel.playNextChannel() },
                            onPreviousChannel = { viewModel.playPreviousChannel() },
                            onRetry = { viewModel.retryPlayback() }
                        )
                    } else {
                        // Standard App Shell
                        Scaffold(
                            modifier = Modifier.fillMaxSize(),
                            containerColor = ObsidianBlack,
                            topBar = {
                                TopBar(
                                    user = user,
                                    onSearchClick = { viewModel.navigateTo(Screen.SEARCH) },
                                    onAdminClick = {
                                        if (uiState.isAdminAuthenticated) {
                                            viewModel.navigateTo(Screen.ADMIN)
                                        } else {
                                            viewModel.openAdminLogin()
                                        }
                                    }
                                )
                            },
                            bottomBar = {
                                BottomNavBar(
                                    currentScreen = uiState.currentScreen,
                                    onNavigate = { viewModel.navigateTo(it) }
                                )
                            }
                        ) { innerPadding ->
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(innerPadding)
                            ) {
                                // Docked Video Player (if active)
                                if (uiState.activePlayback != null) {
                                    VideoPlayerView(
                                        playbackItem = uiState.activePlayback!!,
                                        isPlaying = uiState.isPlaying,
                                        isMuted = uiState.isMuted,
                                        isFullScreen = false,
                                        onTogglePlay = { viewModel.togglePlayPause() },
                                        onToggleMute = { viewModel.toggleMute() },
                                        onToggleFullScreen = { viewModel.toggleFullScreen() },
                                        onClose = { viewModel.stopPlayback() },
                                        onNextChannel = { viewModel.playNextChannel() },
                                        onPreviousChannel = { viewModel.playPreviousChannel() },
                                        onRetry = { viewModel.retryPlayback() }
                                    )
                                }

                                // Main Screen Body
                                Box(modifier = Modifier.weight(1f)) {
                                    when (uiState.currentScreen) {
                                        Screen.HOME -> HomeScreen(
                                            featuredMovie = movies.firstOrNull(),
                                            liveChannels = channels,
                                            movies = movies,
                                            watchlist = watchlist,
                                            watchHistory = watchHistory,
                                            onPlayChannel = { viewModel.playChannel(it) },
                                            onPlayMovie = { viewModel.playMovie(it) },
                                            onSelectMovie = { viewModel.selectMovie(it) },
                                            onToggleWatchlist = { viewModel.toggleWatchlistMovie(it) },
                                            onNavigate = { viewModel.navigateTo(it) }
                                        )

                                        Screen.LIVE_TV -> LiveTvScreen(
                                            channels = channels,
                                            currentPlayingChannelId = uiState.activePlayback?.id,
                                            activeCategory = uiState.activeCategory,
                                            searchQuery = uiState.channelSearchQuery,
                                            viewMode = uiState.channelViewMode,
                                            showOnlyFavorites = uiState.showOnlyFavorites,
                                            isRefreshing = uiState.isRefreshingPlaylist,
                                            syncNotification = uiState.syncNotification,
                                            onRefreshPlaylist = { viewModel.refreshPlaylist() },
                                            onCategorySelect = { viewModel.setActiveCategory(it) },
                                            onSearchChange = { viewModel.setChannelSearch(it) },
                                            onToggleViewMode = { viewModel.toggleViewMode() },
                                            onToggleFavoritesOnly = { viewModel.toggleFavoritesOnly() },
                                            onPlayChannel = { viewModel.playChannel(it) },
                                            onToggleFavorite = { viewModel.toggleFavorite(it) },
                                            onAddChannelClick = { viewModel.openEditChannelModal(null) }
                                        )

                                        Screen.MOVIES -> MoviesScreen(
                                            movies = movies,
                                            watchlist = watchlist,
                                            onSelectMovie = { viewModel.selectMovie(it) },
                                            onToggleWatchlist = { viewModel.toggleWatchlistMovie(it) }
                                        )

                                        Screen.SEARCH -> SearchScreen(
                                            searchQuery = uiState.searchQuery,
                                            channels = channels,
                                            movies = movies,
                                            watchlistIds = watchlist.map { it.contentId }.toSet(),
                                            onQueryChange = { viewModel.setUniversalSearch(it) },
                                            onPlayChannel = { viewModel.playChannel(it) },
                                            onSelectMovie = { viewModel.selectMovie(it) },
                                            onToggleWatchlist = { viewModel.toggleWatchlistMovie(it) },
                                            onToggleFavoriteChannel = { viewModel.toggleFavorite(it) }
                                        )

                                        Screen.SUBSCRIPTIONS -> SubscriptionScreen(
                                            user = user,
                                            activeSubscription = sub,
                                            plans = plans,
                                            onSelectPlan = { viewModel.openCheckout(it) }
                                        )

                                        Screen.WATCHLIST -> WatchlistScreen(
                                            watchlist = watchlist,
                                            watchHistory = watchHistory,
                                            movies = movies,
                                            onPlayMovie = { viewModel.playMovie(it) },
                                            onRemoveFromWatchlist = { viewModel.toggleWatchlistMovie(it) },
                                            onClearHistory = { viewModel.clearHistory() }
                                        )

                                        Screen.ADMIN -> AdminPortalScreen(
                                            channels = channels,
                                            movies = movies,
                                            onAddOrEditChannel = { viewModel.openEditChannelModal(it) },
                                            onDeleteChannel = { viewModel.deleteChannel(it) },
                                            onAddMovie = { viewModel.addMovie(it) },
                                            onSyncPlaylist = { viewModel.refreshPlaylist(it) },
                                            isSyncing = uiState.isRefreshingPlaylist,
                                            syncStatus = uiState.syncNotification,
                                            onLogout = { viewModel.logoutAdmin() }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Dialogs & Modals
                    if (uiState.selectedMovie != null) {
                        MovieDetailSheet(
                            movie = uiState.selectedMovie!!,
                            isInWatchlist = watchlist.any { it.contentId == uiState.selectedMovie!!.id },
                            onDismiss = { viewModel.selectMovie(null) },
                            onPlay = { viewModel.playMovie(uiState.selectedMovie!!) },
                            onToggleWatchlist = { viewModel.toggleWatchlistMovie(uiState.selectedMovie!!) }
                        )
                    }

                    if (uiState.showEditChannelModal) {
                        EditChannelDialog(
                            channelToEdit = uiState.channelToEdit,
                            onDismiss = { viewModel.dismissEditChannelModal() },
                            onSave = { viewModel.saveChannel(it) }
                        )
                    }

                    if (uiState.showAdminLoginModal) {
                        AdminLoginDialog(
                            onDismiss = { viewModel.dismissAdminLogin() },
                            onLogin = { viewModel.authenticateAdmin(it) }
                        )
                    }

                    if (uiState.selectedPlanForCheckout != null) {
                        CheckoutDialog(
                            plan = uiState.selectedPlanForCheckout!!,
                            onDismiss = { viewModel.cancelCheckout() },
                            onConfirmPayment = { viewModel.completeCheckout(uiState.selectedPlanForCheckout!!) }
                        )
                    }

                    if (uiState.premiumAlertMovie != null) {
                        PremiumLockAlert(
                            movie = uiState.premiumAlertMovie!!,
                            onDismiss = { viewModel.dismissPremiumAlert() },
                            onUpgrade = {
                                viewModel.navigateTo(Screen.SUBSCRIPTIONS)
                                viewModel.dismissPremiumAlert()
                            }
                        )
                    }

                    if (uiState.showPaymentSuccessDialog) {
                        AlertDialog(
                            onDismissRequest = { viewModel.dismissPaymentSuccess() },
                            title = { Text("Subscription Activated!", color = Amber500) },
                            text = { Text("Welcome to TamilStream VIP! You now have unlimited access to live channels and 4K blockbuster movies.") },
                            confirmButton = {
                                Button(
                                    onClick = { viewModel.dismissPaymentSuccess() },
                                    colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = ObsidianBlack)
                                ) {
                                    Text("Start Watching")
                                }
                            },
                            containerColor = DarkSurface
                        )
                    }
                }
            }
        }
    }
}
