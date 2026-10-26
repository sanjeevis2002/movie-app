package com.example.tamilstream.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.tamilstream.data.model.PlaybackItem
import com.example.tamilstream.ui.theme.*

@Composable
fun VideoPlayerView(
    playbackItem: PlaybackItem,
    isPlaying: Boolean,
    isMuted: Boolean,
    isFullScreen: Boolean,
    onTogglePlay: () -> Unit,
    onToggleMute: () -> Unit,
    onToggleFullScreen: () -> Unit,
    onClose: () -> Unit,
    onNextChannel: (() -> Unit)? = null,
    onPreviousChannel: (() -> Unit)? = null,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    var showControls by remember { mutableStateOf(true) }

    Box(
        modifier = modifier
            .testTag("video_player_container")
            .fillMaxWidth()
            .then(
                if (isFullScreen) Modifier.fillMaxHeight()
                else Modifier.aspectRatio(16f / 9f)
            )
            .background(Color.Black)
            .clickable { showControls = !showControls }
    ) {
        // Video backdrop / stream visualizer
        AsyncImage(
            model = playbackItem.thumbnail,
            contentDescription = playbackItem.title,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // Dark dim layer
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.45f))
        )

        // Overlay Controls
        AnimatedVisibility(
            visible = showControls,
            enter = fadeIn(),
            exit = fadeOut(),
            modifier = Modifier.fillMaxSize()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                Color.Black.copy(alpha = 0.75f),
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.85f)
                            )
                        )
                    )
                    .padding(12.dp)
            ) {
                // Top bar: Stream info & Close
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        if (playbackItem.isLive) {
                            Surface(
                                color = LiveRed,
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .clip(CircleShape)
                                            .background(Color.White)
                                    )
                                    Text(
                                        text = "LIVE",
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Column {
                            Text(
                                text = playbackItem.title,
                                color = TextPrimary,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                            Text(
                                text = "${playbackItem.category} • HLS 1080P Ultra Stream",
                                color = TextSecondary,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }

                    IconButton(
                        onClick = onClose,
                        modifier = Modifier.testTag("player_close_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close Player",
                            tint = Color.White
                        )
                    }
                }

                // Center Controls: Prev Channel, Play/Pause, Next Channel
                Row(
                    modifier = Modifier.align(Alignment.Center),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    if (onPreviousChannel != null && playbackItem.isLive) {
                        IconButton(
                            onClick = onPreviousChannel,
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.6f))
                                .testTag("player_prev_channel_btn")
                        ) {
                            Icon(
                                imageVector = Icons.Default.SkipPrevious,
                                contentDescription = "Previous Channel",
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }

                    // Center Play/Pause button
                    IconButton(
                        onClick = onTogglePlay,
                        modifier = Modifier
                            .size(58.dp)
                            .clip(CircleShape)
                            .background(Amber500)
                            .testTag("player_play_pause_button")
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isPlaying) "Pause" else "Play",
                            tint = ObsidianBlack,
                            modifier = Modifier.size(34.dp)
                        )
                    }

                    if (onNextChannel != null && playbackItem.isLive) {
                        IconButton(
                            onClick = onNextChannel,
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.6f))
                                .testTag("player_next_channel_btn")
                        ) {
                            Icon(
                                imageVector = Icons.Default.SkipNext,
                                contentDescription = "Next Channel",
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }

                // Bottom bar controls: Mute, Duration, Retry, Fullscreen
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        IconButton(
                            onClick = onToggleMute,
                            modifier = Modifier.testTag("player_mute_button")
                        ) {
                            Icon(
                                imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                                contentDescription = if (isMuted) "Unmute" else "Mute",
                                tint = Color.White
                            )
                        }

                        Text(
                            text = if (playbackItem.isLive) "LIVE HLS STREAM" else "${playbackItem.durationMinutes} min",
                            color = TextSecondary,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium
                        )

                        if (onRetry != null) {
                            TextButton(
                                onClick = onRetry,
                                colors = ButtonDefaults.textButtonColors(contentColor = Amber500),
                                contentPadding = PaddingValues(horizontal = 6.dp)
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = "Retry", modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Retry", fontSize = 11.sp)
                            }
                        }
                    }

                    IconButton(
                        onClick = onToggleFullScreen,
                        modifier = Modifier.testTag("player_fullscreen_button")
                    ) {
                        Icon(
                            imageVector = if (isFullScreen) Icons.Default.FullscreenExit else Icons.Default.Fullscreen,
                            contentDescription = "Fullscreen",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    }
}
