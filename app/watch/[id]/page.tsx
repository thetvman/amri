import { WatchDetails } from "@/components/watch-details"
import { getMediaDetails } from "@/lib/tmdb"

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
