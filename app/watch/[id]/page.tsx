import { WatchDetails } from "@/components/watch-details"
import { LibraryWatchDetails } from "@/components/library-watch-details"
import { getMediaDetails } from "@/lib/tmdb"
import { getLibrary } from "@/lib/library"

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ type?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const typeParam =
    resolvedSearchParams?.type === "movie" || resolvedSearchParams?.type === "tv"
      ? resolvedSearchParams.type
      : undefined
  const sourceParam = resolvedSearchParams?.source

  if (sourceParam === "library") {
    const library = await getLibrary()
    const collection = typeParam === "tv" ? library.tv : library.movies
    const item =
      collection.find((entry) => entry.id === id) ||
      library.movies.find((entry) => entry.id === id) ||
      library.tv.find((entry) => entry.id === id)

    if (!item) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">This library item is no longer available.</p>
        </div>
      )
    }

    return (
      <LibraryWatchDetails
        item={{
          id: item.id,
          title: item.title,
          type: item.type,
          year: item.year,
          rating: item.rating,
          overview: item.overview,
          poster: item.poster,
          backdrop: item.backdrop,
          runtime: item.runtime,
          quality: item.quality,
          path: item.path,
        }}
      />
    )
  }

  const details = await getMediaDetails(id, typeParam)

  if (!details) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load this title.</p>
      </div>
    )
  }

  return <WatchDetails details={details} />
}
