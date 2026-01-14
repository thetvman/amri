import { HomeScreen } from "@/components/home-screen"
import { getTrendingTV } from "@/lib/tmdb"

export default async function TvPage() {
  let items = []
  try {
    items = await getTrendingTV()
  } catch (error) {
    console.error("Failed to load trending TV shows:", error)
  }

  return (
    <HomeScreen
      items={items}
      title="Trending TV Shows"
      subtitle="Binge-worthy series topping the charts"
      showCategoryFilter={false}
      defaultCategory="tv"
    />
  )
}
