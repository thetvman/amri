import { HomeScreen } from "@/components/home-screen"
import { getTrendingMovies } from "@/lib/tmdb"

export default async function MoviesPage() {
  let items = []
  try {
    items = await getTrendingMovies()
  } catch (error) {
    console.error("Failed to load trending movies:", error)
  }

  return (
    <HomeScreen
      items={items}
      title="Trending Movies"
      subtitle="The most talked-about movies right now"
      showCategoryFilter={false}
      defaultCategory="movies"
    />
  )
}
