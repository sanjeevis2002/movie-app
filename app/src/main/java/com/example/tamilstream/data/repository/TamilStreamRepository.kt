package com.example.tamilstream.data.repository

import com.example.tamilstream.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class TamilStreamRepository {

    // Initial Live Channels
    private val initialChannels = listOf(
        Channel(
            id = "7smusic_in_sd",
            name = "7S Music (576p)",
            cleanName = "7S Music",
            resolution = "576P",
            logo = "https://i.imgur.com/zDiIhdN.png",
            group = "Music",
            url = "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
            enabled = true,
            isFeatured = true
        ),
        Channel(
            id = "aaryaatv_in_sd",
            name = "Aaryaa TV (1080p)",
            cleanName = "Aaryaa TV",
            resolution = "1080P",
            logo = "https://jiotvimages.cdn.jio.com/dare_images/images/aryatvtamil.png",
            group = "Music",
            url = "https://stream.ottlive.co.in/aryatvtamil/index.m3u8",
            enabled = true,
            isFeatured = true
        ),
        Channel(
            id = "polimer_news_sd",
            name = "Polimer News (1080p)",
            cleanName = "Polimer News",
            resolution = "1080P",
            logo = "https://upload.wikimedia.org/wikipedia/en/2/23/Polimer_News_logo.png",
            group = "News",
            url = "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
            enabled = true,
            isFeatured = true
        ),
        Channel(
            id = "thanthi_tv_sd",
            name = "Thanthi TV (720p)",
            cleanName = "Thanthi TV",
            resolution = "720P",
            logo = "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Thanthi_TV_Logo.png/220px-Thanthi_TV_Logo.png",
            group = "News",
            url = "https://stream.ottlive.co.in/aryatvtamil/index.m3u8",
            enabled = true,
            isFeatured = true
        ),
        Channel(
            id = "sun_tv_live",
            name = "Sun TV Tamil (1080p)",
            cleanName = "Sun TV",
            resolution = "1080P",
            logo = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sun_TV_logo.svg/200px-Sun_TV_logo.svg.png",
            group = "Entertainment",
            url = "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
            enabled = true,
            isFeatured = true
        ),
        Channel(
            id = "ktv_movies",
            name = "KTV Movies (720p)",
            cleanName = "KTV",
            resolution = "720P",
            logo = "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/KTV_%28India%29_logo.png/220px-KTV_%28India%29_logo.png",
            group = "Movies",
            url = "https://stream.ottlive.co.in/aryatvtamil/index.m3u8",
            enabled = true,
            isFeatured = true
        ),
        Channel(
            id = "aaseervathamtv_in_sd",
            name = "Aaseervatham TV (576p)",
            cleanName = "Aaseervatham TV",
            resolution = "576P",
            logo = "https://i.imgur.com/GlfrYs7.png",
            group = "Religious",
            url = "https://mumt04.tangotv.in/m18aqlK4AASEERVATHAMTV/index.m3u8",
            enabled = true
        ),
        Channel(
            id = "aasthatamil_in_sd",
            name = "Aastha Tamil (480p)",
            cleanName = "Aastha Tamil",
            resolution = "480P",
            logo = "https://i.imgur.com/YQK9ewf.png",
            group = "Religious",
            url = "https://aasthaott.akamaized.net/110923/smil:aasthatamil.smil/playlist.m3u8",
            enabled = true
        ),
        Channel(
            id = "amntv_in_sd",
            name = "AMN TV (576p)",
            cleanName = "AMN TV",
            resolution = "576P",
            logo = "https://amntv.in/wp-content/uploads/2025/04/amntv-logo.png",
            group = "General",
            url = "https://live.onecloudlive.in/amn/amntv/index.m3u8",
            enabled = true
        ),
        Channel(
            id = "angeltv_in_india",
            name = "Angel TV (720p)",
            cleanName = "Angel TV",
            resolution = "720P",
            logo = "https://i.imgur.com/qKLEGU7.png",
            group = "Religious",
            url = "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
            enabled = true
        )
    )

    // Initial OTT Movies
    private val initialMovies = listOf(
        Movie(
            id = "movie_leo",
            title = "Leo: Bloody Sweet",
            slug = "leo-bloody-sweet",
            poster = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
            thumbnail = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
            backdrop = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
            description = "Parthiban is an unassuming cafe owner in Theog who becomes a local hero after thwarting an armed robbery. But a mysterious syndicate mistakes him for Leo Das.",
            synopsis = "A mild-mannered cafe owner in Kashmir must protect his family when notorious gangsters from his rumored past return with a vengeance.",
            genre = listOf("Action", "Thriller", "Crime"),
            language = "Tamil",
            releaseYear = 2023,
            ageRating = "U/A 16+",
            cast = listOf("Thalapathy Vijay", "Sanjay Dutt", "Arjun Sarja", "Trisha Krishnan"),
            director = "Lokesh Kanagaraj",
            duration = 164,
            videoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            isFeatured = true,
            isTrending = true,
            isPremium = true,
            views = 184500,
            rating = 8.6
        ),
        Movie(
            id = "movie_vikram",
            title = "Vikram: Hitlist",
            slug = "vikram-hitlist",
            poster = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80",
            thumbnail = "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
            backdrop = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
            description = "A black-ops squad led by Amar is assigned to track down a covert masked vigilante syndicate after a series of high-profile murders in the city.",
            synopsis = "Investigating a masked vigilante group leads commander Amar down an explosive rabbit hole involving black-ops legend Agent Vikram.",
            genre = listOf("Action", "Crime", "Suspense"),
            language = "Tamil",
            releaseYear = 2022,
            ageRating = "U/A 16+",
            cast = listOf("Kamal Haasan", "Vijay Sethupathi", "Fahadh Faasil", "Suriya"),
            director = "Lokesh Kanagaraj",
            duration = 173,
            videoUrl = "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
            isFeatured = true,
            isTrending = true,
            isPremium = false,
            views = 295000,
            rating = 8.9
        ),
        Movie(
            id = "movie_jailer",
            title = "Jailer: Tiger Ka Hukum",
            slug = "jailer-tiger-ka-hukum",
            poster = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
            thumbnail = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
            backdrop = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
            description = "Muthuvel Pandian, a retired prison warden known for his strict ethics, embarks on a relentless path of retribution when an idol-smuggling cartel harms his family.",
            synopsis = "A retired jailer goes on a manhunt to find his police officer son's killers, encountering formidable underworld figures along the way.",
            genre = listOf("Action", "Dark Comedy", "Revenge"),
            language = "Tamil",
            releaseYear = 2023,
            ageRating = "U/A 16+",
            cast = listOf("Rajinikanth", "Mohanlal", "Shiva Rajkumar", "Ramya Krishnan"),
            director = "Nelson Dilipkumar",
            duration = 168,
            videoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            isFeatured = true,
            isTrending = true,
            isPremium = true,
            views = 310000,
            rating = 8.4
        ),
        Movie(
            id = "movie_ps2",
            title = "Ponniyin Selvan: Part II",
            slug = "ponniyin-selvan-2",
            poster = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
            thumbnail = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80",
            backdrop = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
            description = "Arulmozhi Varman continues his journey to become Rajaraja I, the greatest ruler of the historic Chola Empire, navigating betrayal and royal conspiracies.",
            synopsis = "The epic climax unfolds as Chola crown prince Aditha Karikalan confronts the vengeful queen Nandini, while conspiracies threaten the realm.",
            genre = listOf("Historical", "Epic Drama", "Action"),
            language = "Tamil",
            releaseYear = 2023,
            ageRating = "U/A 13+",
            cast = listOf("Vikram", "Aishwarya Rai Bachchan", "Jayam Ravi", "Karthi", "Trisha"),
            director = "Mani Ratnam",
            duration = 164,
            videoUrl = "https://cdn.pishow.tv/ott/live/1257/master.m3u8",
            isFeatured = false,
            isTrending = true,
            isPremium = false,
            views = 245000,
            rating = 8.7
        )
    )

    // Subscription Plans
    private val subscriptionPlans = listOf(
        SubscriptionPlan(
            id = "plan_basic",
            name = "Basic Tamil Pack",
            slug = "basic",
            priceInr = 199,
            durationDays = 30,
            billingPeriodLabel = "30 Days",
            description = "Essential access to all live Tamil channels with zero ads and HD 720p quality.",
            features = listOf(
                "Access to 50+ Live Tamil Channels",
                "HD 720p Streaming Quality",
                "1 Device Simultaneous Streaming",
                "Instant Activation"
            ),
            videoQuality = "HD 720p",
            maxScreens = 1
        ),
        SubscriptionPlan(
            id = "plan_premium",
            name = "Gold Premium OTT",
            slug = "premium",
            priceInr = 499,
            durationDays = 90,
            billingPeriodLabel = "3 Months",
            description = "Full access to Live TV, Blockbuster Tamil Movies & Web Series with 1080p stream.",
            features = listOf(
                "All Live TV Channels + OTT Movies",
                "Full HD 1080p & Dolby Audio",
                "3 Devices Simultaneous Stream",
                "Exclusive New Tamil Releases",
                "Ad-Free Premium Player"
            ),
            isFeatured = true,
            videoQuality = "Full HD 1080p",
            maxScreens = 3,
            badge = "Most Popular"
        ),
        SubscriptionPlan(
            id = "plan_ultimate",
            name = "Ultimate VIP Annual",
            slug = "ultimate",
            priceInr = 1499,
            durationDays = 365,
            billingPeriodLabel = "1 Year",
            description = "The ultimate Tamil entertainment experience in 4K Ultra HD for the whole family.",
            features = listOf(
                "Complete Catalog (Live TV + 4K Movies)",
                "4K Ultra HD + Dolby Atmos",
                "5 Devices Simultaneous Streaming",
                "Offline Download Support",
                "Priority VIP Support & Early Premieres"
            ),
            videoQuality = "4K Ultra HD + Dolby",
            maxScreens = 5,
            badge = "Best Value"
        )
    )

    // Reactive State
    private val _channels = MutableStateFlow(initialChannels)
    val channels: StateFlow<List<Channel>> = _channels.asStateFlow()

    private val _movies = MutableStateFlow(initialMovies)
    val movies: StateFlow<List<Movie>> = _movies.asStateFlow()

    private val _plans = MutableStateFlow(subscriptionPlans)
    val plans: StateFlow<List<SubscriptionPlan>> = _plans.asStateFlow()

    private val _watchlist = MutableStateFlow<List<WatchlistItem>>(emptyList())
    val watchlist: StateFlow<List<WatchlistItem>> = _watchlist.asStateFlow()

    private val _watchHistory = MutableStateFlow<List<WatchHistoryItem>>(emptyList())
    val watchHistory: StateFlow<List<WatchHistoryItem>> = _watchHistory.asStateFlow()

    private val _currentUser = MutableStateFlow(User(isPremium = false))
    val currentUser: StateFlow<User> = _currentUser.asStateFlow()

    private val _currentSubscription = MutableStateFlow<UserSubscription?>(null)
    val currentSubscription: StateFlow<UserSubscription?> = _currentSubscription.asStateFlow()

    fun toggleFavorite(channelId: String) {
        _channels.update { list ->
            list.map { ch ->
                if (ch.id == channelId) ch.copy(isFavorite = !ch.isFavorite) else ch
            }
        }
    }

    fun addChannel(channel: Channel) {
        _channels.update { listOf(channel) + it }
    }

    fun updateChannel(updated: Channel) {
        _channels.update { list ->
            list.map { if (it.id == updated.id) updated else it }
        }
    }

    fun deleteChannel(channelId: String) {
        _channels.update { list -> list.filterNot { it.id == channelId } }
    }

    fun addMovie(movie: Movie) {
        _movies.update { listOf(movie) + it }
    }

    fun toggleWatchlist(item: WatchlistItem) {
        _watchlist.update { list ->
            val exists = list.any { it.contentId == item.contentId }
            if (exists) {
                list.filterNot { it.contentId == item.contentId }
            } else {
                listOf(item) + list
            }
        }
    }

    fun recordHistory(item: WatchHistoryItem) {
        _watchHistory.update { list ->
            val filtered = list.filterNot { it.contentId == item.contentId }
            listOf(item) + filtered.take(19)
        }
    }

    fun clearHistory() {
        _watchHistory.value = emptyList()
    }

    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    suspend fun syncWithM3u(url: String = M3uPlaylistService.DEFAULT_M3U_URL): Int {
        _isSyncing.value = true
        try {
            val parsedChannels = M3uPlaylistService.fetchAndParseM3u(url)
            if (parsedChannels.isNotEmpty()) {
                _channels.update { existing ->
                    val manualChannels = existing.filter { it.isCustom }
                    val existingMap = existing.associateBy { it.id }

                    val mergedParsed = parsedChannels.map { parsed ->
                        val prev = existingMap[parsed.id]
                        if (prev != null) {
                            parsed.copy(isFavorite = prev.isFavorite)
                        } else {
                            parsed
                        }
                    }

                    manualChannels + mergedParsed
                }
                _lastSyncTime.value = System.currentTimeMillis()
                return parsedChannels.size
            }
        } finally {
            _isSyncing.value = false
        }
        return 0
    }

    fun getNextChannel(currentChannelId: String): Channel? {
        val list = _channels.value.filter { it.enabled }
        if (list.isEmpty()) return null
        val idx = list.indexOfFirst { it.id == currentChannelId }
        return if (idx != -1 && idx < list.size - 1) list[idx + 1] else list.firstOrNull()
    }

    fun getPreviousChannel(currentChannelId: String): Channel? {
        val list = _channels.value.filter { it.enabled }
        if (list.isEmpty()) return null
        val idx = list.indexOfFirst { it.id == currentChannelId }
        return if (idx > 0) list[idx - 1] else list.lastOrNull()
    }

    fun activateSubscription(plan: SubscriptionPlan) {
        val sub = UserSubscription(
            id = "sub_${System.currentTimeMillis()}",
            planId = plan.id,
            planName = plan.name,
            amountInr = plan.priceInr,
            startDate = "Today",
            expiryDate = "In ${plan.durationDays} days",
            videoQuality = plan.videoQuality
        )
        _currentSubscription.value = sub
        _currentUser.update { it.copy(isPremium = true) }
    }
}
