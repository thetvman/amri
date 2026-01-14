import { HomeScreen } from "@/components/home-screen"
import { getTrendingMedia } from "@/lib/tmdb"

export default async function Page() {
  let items = []
  try {
    items = await getTrendingMedia()
  } catch (error) {
    console.error("Failed to load trending media:", error)
  }

  return (
    <HomeScreen
      items={items}
      title="Your Private Media Library"
      subtitle="Stream trending movies and TV shows in stunning quality"
      showCategoryFilter
    />
  )
}
