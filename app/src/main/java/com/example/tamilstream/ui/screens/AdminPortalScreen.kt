package com.example.tamilstream.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tamilstream.data.model.Channel
import com.example.tamilstream.data.model.Movie
import com.example.tamilstream.data.repository.M3uPlaylistService
import com.example.tamilstream.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPortalScreen(
    channels: List<Channel>,
    movies: List<Movie>,
    onAddOrEditChannel: (Channel?) -> Unit,
    onDeleteChannel: (String) -> Unit,
    onAddMovie: (Movie) -> Unit,
    onSyncPlaylist: (String) -> Unit = {},
    isSyncing: Boolean = false,
    syncStatus: String? = null,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    var adminTab by remember { mutableStateOf(0) } // 0: Channels, 1: M3U Sync, 2: Publish Movie, 3: Overview

    Column(
        modifier = modifier
            .testTag("admin_portal_screen")
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Admin Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AdminPanelSettings,
                    contentDescription = "Admin",
                    tint = Amber500
                )
                Text(
                    text = "Control Portal",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }

            TextButton(
                onClick = onLogout,
                colors = ButtonDefaults.textButtonColors(contentColor = LiveRed),
                modifier = Modifier.testTag("admin_logout_btn")
            ) {
                Icon(Icons.Default.Logout, contentDescription = "Exit")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Exit Portal")
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Tab Navigation
        TabRow(
            selectedTabIndex = adminTab,
            containerColor = DarkSurface,
            contentColor = Amber500
        ) {
            Tab(
                selected = adminTab == 0,
                onClick = { adminTab = 0 },
                text = { Text("Channels (${channels.size})") }
            )
            Tab(
                selected = adminTab == 1,
                onClick = { adminTab = 1 },
                text = { Text("M3U Sync") }
            )
            Tab(
                selected = adminTab == 2,
                onClick = { adminTab = 2 },
                text = { Text("Publish Film") }
            )
            Tab(
                selected = adminTab == 3,
                onClick = { adminTab = 3 },
                text = { Text("Overview") }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        when (adminTab) {
            0 -> {
                // Channels Manager
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Manage IPTV Streams",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )

                    Button(
                        onClick = { onAddOrEditChannel(null) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Amber500,
                            contentColor = ObsidianBlack
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("admin_add_channel_btn")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("New Channel")
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn(
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(channels) { ch ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("admin_channel_row_${ch.id}"),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(containerColor = DarkSurface)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = ch.cleanName,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = "${ch.group} • ${ch.resolution} • ${if (ch.enabled) "Active" else "Disabled"}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextSecondary
                                    )
                                }

                                Row {
                                    IconButton(onClick = { onAddOrEditChannel(ch) }) {
                                        Icon(
                                            imageVector = Icons.Default.Edit,
                                            contentDescription = "Edit",
                                            tint = Amber500
                                        )
                                    }
                                    IconButton(onClick = { onDeleteChannel(ch.id) }) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "Delete",
                                            tint = LiveRed
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            1 -> {
                // M3U Playlist Sync Panel
                var playlistUrlInput by remember { mutableStateOf(M3uPlaylistService.DEFAULT_M3U_URL) }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "M3U Playlist Source & Synchronization",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )

                    Text(
                        text = "Synchronize live Tamil TV channels directly from public M3U sources. Duplicate streams are merged safely and manual channel overrides are preserved.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )

                    OutlinedTextField(
                        value = playlistUrlInput,
                        onValueChange = { playlistUrlInput = it },
                        label = { Text("M3U Playlist URL") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("admin_playlist_url_input"),
                        singleLine = true
                    )

                    Button(
                        onClick = { onSyncPlaylist(playlistUrlInput) },
                        enabled = !isSyncing,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Amber500,
                            contentColor = ObsidianBlack
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("admin_sync_playlist_btn")
                    ) {
                        if (isSyncing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = ObsidianBlack,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Fetching & Parsing M3U...")
                        } else {
                            Icon(Icons.Default.Sync, contentDescription = "Sync")
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Synchronize Playlist Now", fontWeight = FontWeight.Bold)
                        }
                    }

                    if (syncStatus != null) {
                        Surface(
                            color = Amber500.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = syncStatus,
                                color = Amber500,
                                fontWeight = FontWeight.Medium,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = DarkSurface)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "Configured Source Specifications",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("• Default Feed: iptv-org Tamil Collection", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                            Text("• Stream Protocol: HLS / HTTP Live Streaming (.m3u8)", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                            Text("• Parsing Engine: Coroutine Multi-Thread Parser", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                            Text("• Status: ${channels.size} Channels In Registry", style = MaterialTheme.typography.bodySmall, color = LiveGreen)
                        }
                    }
                }
            }

            2 -> {
                // Add Movie Form
                var title by remember { mutableStateOf("") }
                var videoUrl by remember { mutableStateOf("") }
                var posterUrl by remember { mutableStateOf("") }
                var genre by remember { mutableStateOf("Action") }
                var duration by remember { mutableStateOf("150") }
                var isVip by remember { mutableStateOf(false) }
                var isSaved by remember { mutableStateOf(false) }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Add New Film to Catalog",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Movie Title") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("admin_movie_title_input"),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = videoUrl,
                        onValueChange = { videoUrl = it },
                        label = { Text("Stream URL (HLS / MP4)") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("admin_movie_url_input"),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = posterUrl,
                        onValueChange = { posterUrl = it },
                        label = { Text("Poster Image URL") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedTextField(
                            value = genre,
                            onValueChange = { genre = it },
                            label = { Text("Genre") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = duration,
                            onValueChange = { duration = it },
                            label = { Text("Duration (m)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Switch(
                            checked = isVip,
                            onCheckedChange = { isVip = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = Amber500)
                        )
                        Text(
                            text = "Require VIP / Premium Subscription",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextPrimary
                        )
                    }

                    Button(
                        onClick = {
                            if (title.isNotBlank() && videoUrl.isNotBlank()) {
                                onAddMovie(
                                    Movie(
                                        id = "custom_${System.currentTimeMillis()}",
                                        title = title,
                                        poster = if (posterUrl.isNotBlank()) posterUrl else "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
                                        thumbnail = if (posterUrl.isNotBlank()) posterUrl else "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
                                        description = "Newly published Tamil cinema release.",
                                        genre = listOf(genre),
                                        duration = duration.toIntOrNull() ?: 140,
                                        videoUrl = videoUrl,
                                        isPremium = isVip
                                    )
                                )
                                title = ""
                                videoUrl = ""
                                posterUrl = ""
                                isSaved = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Amber500,
                            contentColor = ObsidianBlack
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("admin_save_movie_btn")
                    ) {
                        Text("Publish to Catalog", fontWeight = FontWeight.Bold)
                    }

                    if (isSaved) {
                        Text(
                            text = "✓ Movie successfully published!",
                            color = LiveGreen,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }

            3 -> {
                // System stats overview
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "System Performance & Health",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(
                            title = "Active Streams",
                            value = "${channels.size}",
                            subtitle = "Online HLS",
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "OTT Films",
                            value = "${movies.size}",
                            subtitle = "Ready to Stream",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(
                            title = "Stream Engine",
                            value = "HLS v7",
                            subtitle = "Ultra Low Latency",
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Gateway API",
                            value = "IMB Live",
                            subtitle = "Sandbox Connected",
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    subtitle: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(DarkBorder),
            width = 0.5.dp
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black,
                color = Amber500
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, style = MaterialTheme.typography.labelSmall, color = TextMuted)
        }
    }
}
