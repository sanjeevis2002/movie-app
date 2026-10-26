package com.example.tamilstream.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkRemove
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.tamilstream.data.model.Movie
import com.example.tamilstream.data.model.WatchHistoryItem
import com.example.tamilstream.data.model.WatchlistItem
import com.example.tamilstream.ui.theme.*

@Composable
fun WatchlistScreen(
    watchlist: List<WatchlistItem>,
    watchHistory: List<WatchHistoryItem>,
    movies: List<Movie>,
    onPlayMovie: (Movie) -> Unit,
    onRemoveFromWatchlist: (Movie) -> Unit,
    onClearHistory: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(0) } // 0: Watchlist, 1: History

    Column(
        modifier = modifier
            .testTag("watchlist_screen")
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Title Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "My Library",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )

            if (selectedTab == 1 && watchHistory.isNotEmpty()) {
                IconButton(
                    onClick = onClearHistory,
                    modifier = Modifier.testTag("clear_history_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.DeleteSweep,
                        contentDescription = "Clear History",
                        tint = LiveRed
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = DarkSurface,
            contentColor = Amber500
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Watchlist (${watchlist.size})") }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("History (${watchHistory.size})") }
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (selectedTab == 0) {
            if (watchlist.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Your Watchlist is Empty",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Save movies from the Movies screen to watch them later.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(watchlist) { item ->
                        val movie = movies.find { it.id == item.contentId }
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("watchlist_item_${item.contentId}"),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = DarkSurface)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                AsyncImage(
                                    model = item.poster,
                                    contentDescription = item.title,
                                    modifier = Modifier
                                        .size(60.dp, 80.dp)
                                        .clip(RoundedCornerShape(6.dp)),
                                    contentScale = ContentScale.Crop
                                )

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = item.title,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = "${item.releaseYear ?: 2023} • ${item.category ?: "Cinema"}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextSecondary
                                    )
                                }

                                if (movie != null) {
                                    IconButton(
                                        onClick = { onPlayMovie(movie) },
                                        modifier = Modifier.background(Amber500, RoundedCornerShape(8.dp))
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.PlayArrow,
                                            contentDescription = "Play",
                                            tint = ObsidianBlack
                                        )
                                    }

                                    IconButton(onClick = { onRemoveFromWatchlist(movie) }) {
                                        Icon(
                                            imageVector = Icons.Default.BookmarkRemove,
                                            contentDescription = "Remove",
                                            tint = TextSecondary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Watch History Tab
            if (watchHistory.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "No Watch History",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Items you stream will automatically appear here.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(watchHistory) { hist ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("history_item_${hist.id}"),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = DarkSurface)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                AsyncImage(
                                    model = hist.thumbnail,
                                    contentDescription = hist.title,
                                    modifier = Modifier
                                        .size(70.dp, 50.dp)
                                        .clip(RoundedCornerShape(6.dp)),
                                    contentScale = ContentScale.Crop
                                )

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = hist.title,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = if (hist.contentType == "channel") "Live Channel Stream" else "Movie Playback",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextSecondary
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
