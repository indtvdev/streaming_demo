import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import java.io.File

class EpisodesParser {
    // Data model classes
    data class EpisodesResponse(
        val version: String,
        val channelid: String,
        val episodes: List<Category>
    )

    data class Category(
        val name: String,
        val episode: List<Episode>
    )

    data class Episode(
        val id: String,
        val title: String,
        val date: String,
        val views: String,
        val url: String,
        val bg: String,
        val card: String
    )

    private val gson = Gson()

    // Function to parse JSON
    fun parseEpisodesJson(jsonString: String): EpisodesResponse? {
        return try {
            gson.fromJson(jsonString, EpisodesResponse::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    // Function to read JSON from a file and parse it
    fun readJsonFromFile(filePath: String): EpisodesResponse? {
        return try {
            val jsonString = File(filePath).readText()
            parseEpisodesJson(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

// Example usage
fun main() {
    val filePath = "episodes.json" // Update with actual file path
    val parser = EpisodesParser()
    val episodesData = parser.readJsonFromFile(filePath)
    println(episodesData)
}
