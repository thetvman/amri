import { HomeScreen } from "@/components/home-screen"
import { getLibrary } from "@/lib/library"

export default async function MoviesLibraryPage() {
  const library = await getLibrary()
  const items = library.movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    rating: "N/A",
    genre: movie.quality || "HD",
    poster: movie.poster || "/placeholder.svg",
    type: "movie" as const,
  }))

  return (
    <HomeScreen
      items={items}
      title="Movies Library"
      subtitle="Your synced Radarr collection"
      showCategoryFilter={false}
      defaultCategory="movies"
    />
  )
}
