import { HomeScreen } from "@/components/home-screen"
import { getLibrary } from "@/lib/library"

export default async function TvLibraryPage() {
  const library = await getLibrary()
  const items = library.tv.map((show) => ({
    id: show.id,
    title: show.title,
    year: show.year,
    rating: "N/A",
    genre: show.quality || "HD",
    poster: show.poster || "/placeholder.svg",
    type: "tv" as const,
  }))

  return (
    <HomeScreen
      items={items}
      title="TV Library"
      subtitle="Your synced Sonarr collection"
      showCategoryFilter={false}
      defaultCategory="tv"
    />
  )
}
