package com.example.tamilstream.data.repository

import com.example.tamilstream.data.model.Channel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.regex.Pattern

object M3uPlaylistService {

    const val DEFAULT_M3U_URL = "https://iptv-org.github.io/iptv/languages/tam.m3u"

    suspend fun fetchAndParseM3u(playlistUrl: String = DEFAULT_M3U_URL): List<Channel> = withContext(Dispatchers.IO) {
        val channels = mutableListOf<Channel>()
        var connection: HttpURLConnection? = null

        try {
            val url = URL(playlistUrl)
            connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 10000
            connection.readTimeout = 15000
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Android; Mobile) TamilStream/1.0")

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader(InputStreamReader(connection.inputStream)).use { reader ->
                    var line: String?
                    var currentExtInf: String? = null

                    val idPattern = Pattern.compile("tvg-id=\"([^\"]*)\"")
                    val logoPattern = Pattern.compile("tvg-logo=\"([^\"]*)\"")
                    val groupPattern = Pattern.compile("group-title=\"([^\"]*)\"")

                    while (reader.readLine().also { line = it } != null) {
                        val trimmed = line?.trim() ?: continue
                        if (trimmed.isEmpty() || trimmed.startsWith("#EXTM3U")) continue

                        if (trimmed.startsWith("#EXTINF:")) {
                            currentExtInf = trimmed
                            continue
                        }

                        if (currentExtInf != null && !trimmed.startsWith("#")) {
                            val streamUrl = trimmed

                            // Parse tvg metadata
                            val idMatcher = idPattern.matcher(currentExtInf)
                            val tvgId = if (idMatcher.find()) idMatcher.group(1) ?: "" else ""

                            val logoMatcher = logoPattern.matcher(currentExtInf)
                            val logoUrl = if (logoMatcher.find()) logoMatcher.group(1) ?: "" else "https://i.imgur.com/zDiIhdN.png"

                            val groupMatcher = groupPattern.matcher(currentExtInf)
                            var groupTitle = if (groupMatcher.find()) groupMatcher.group(1) ?: "General" else "General"
                            if (groupTitle.contains(";")) {
                                groupTitle = groupTitle.split(";")[0]
                            }

                            // Extract Channel Name
                            val commaIdx = currentExtInf.lastIndexOf(',')
                            val rawName = if (commaIdx != -1) currentExtInf.substring(commaIdx + 1).trim() else "Tamil Channel"

                            // Clean Name
                            var cleanName = rawName.replace(Regex("\\s*\\(.*?\\)"), "").trim()
                            cleanName = cleanName.replace(Regex("\\s*\\[.*?\\]"), "").trim()

                            // Extract Resolution
                            val res = if (rawName.contains("1080p", ignoreCase = true)) "1080P"
                            else if (rawName.contains("720p", ignoreCase = true)) "720P"
                            else if (rawName.contains("576p", ignoreCase = true)) "576P"
                            else if (rawName.contains("480p", ignoreCase = true)) "480P"
                            else "1080P"

                            val channelKey = if (tvgId.isNotEmpty()) {
                                tvgId.lowercase().replace(Regex("[^a-z0-9_]"), "_")
                            } else {
                                "ch_" + streamUrl.hashCode().toString().replace("-", "n")
                            }

                            // Exclude explicit geo-blocked channels
                            val isGeoBlocked = rawName.contains("Geo-blocked", ignoreCase = true)

                            channels.add(
                                Channel(
                                    id = channelKey,
                                    name = rawName,
                                    cleanName = if (cleanName.isNotEmpty()) cleanName else rawName,
                                    resolution = res,
                                    logo = if (logoUrl.isNotEmpty()) logoUrl else "https://i.imgur.com/zDiIhdN.png",
                                    group = groupTitle.replaceFirstChar { it.uppercase() },
                                    url = streamUrl,
                                    enabled = !isGeoBlocked,
                                    isFeatured = channels.size < 5
                                )
                            )

                            currentExtInf = null
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            connection?.disconnect()
        }

        channels
    }
}
