package com.example.tamilstream.data.model

data class Channel(
    val id: String = "",
    val name: String,
    val cleanName: String = name,
    val resolution: String = "1080P",
    val logo: String,
    val group: String = "General",
    val url: String,
    val enabled: Boolean = true,
    val isFavorite: Boolean = false,
    val isFeatured: Boolean = false,
    val isCustom: Boolean = false,
    val addedAt: Long = System.currentTimeMillis()
)

data class Movie(
    val id: String,
    val title: String,
    val slug: String = "",
    val poster: String,
    val thumbnail: String,
    val backdrop: String = thumbnail,
    val description: String,
    val synopsis: String = description,
    val genre: List<String> = emptyList(),
    val language: String = "Tamil",
    val releaseYear: Int = 2024,
    val ageRating: String = "U/A 16+",
    val cast: List<String> = emptyList(),
    val director: String = "",
    val duration: Int = 140, // in minutes
    val videoUrl: String,
    val isFeatured: Boolean = false,
    val isTrending: Boolean = false,
    val isPremium: Boolean = false,
    val views: Long = 0,
    val rating: Double = 8.5
)

data class TVShow(
    val id: String,
    val title: String,
    val description: String,
    val poster: String,
    val banner: String,
    val language: String = "Tamil",
    val genre: List<String> = emptyList(),
    val releaseYear: Int = 2024,
    val isPremium: Boolean = false,
    val rating: Double = 8.0,
    val totalSeasons: Int = 1
)

data class LiveStream(
    val id: String,
    val title: String,
    val description: String,
    val thumbnail: String,
    val streamUrl: String,
    val status: String = "live",
    val language: String = "Tamil",
    val category: String = "News",
    val isFeatured: Boolean = false
)

data class User(
    val id: String = "user_guest",
    val name: String = "Sanjeevi (Guest)",
    val email: String = "sanjeevidaa@gmail.com",
    val avatar: String = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    val role: String = "user",
    val isPremium: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

data class SubscriptionPlan(
    val id: String,
    val name: String,
    val slug: String,
    val priceInr: Int,
    val durationDays: Int,
    val billingPeriodLabel: String,
    val description: String,
    val features: List<String>,
    val isFeatured: Boolean = false,
    val videoQuality: String = "Full HD 1080p",
    val maxScreens: Int = 2,
    val badge: String? = null
)

data class UserSubscription(
    val id: String,
    val planId: String,
    val planName: String,
    val amountInr: Int,
    val startDate: String,
    val expiryDate: String,
    val status: String = "active",
    val videoQuality: String = "4K Ultra HD"
)

data class WatchlistItem(
    val id: String,
    val contentId: String,
    val contentType: String, // "movie" or "channel"
    val title: String,
    val poster: String,
    val rating: Double? = null,
    val releaseYear: Int? = null,
    val category: String? = null,
    val addedAt: Long = System.currentTimeMillis()
)

data class WatchHistoryItem(
    val id: String,
    val contentId: String,
    val contentType: String,
    val title: String,
    val thumbnail: String,
    val progressSeconds: Long = 0,
    val durationSeconds: Long = 0,
    val watchedAt: Long = System.currentTimeMillis()
)

data class PlaybackItem(
    val id: String,
    val title: String,
    val streamUrl: String,
    val thumbnail: String,
    val category: String,
    val isLive: Boolean = true,
    val durationMinutes: Int = 0
)
