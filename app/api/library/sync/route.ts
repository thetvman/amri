import { NextResponse } from "next/server"
import { getSettings } from "@/lib/settings"
import { saveLibrary, type LibraryItem } from "@/lib/library"

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "N/A"
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function formatRating(value?: number) {
  if (!value || Number.isNaN(value)) return "N/A"
  return value.toFixed(1)
}

function getImageUrl(images: any[] | undefined, coverType: string) {
  const match = images?.find((image) => image.coverType === coverType)
  return match?.remoteUrl || match?.url || undefined
}

async function fetchSonarr(url: string, apiKey: string): Promise<LibraryItem[]> {
  const response = await fetch(`${url}/api/v3/series`, {
    headers: { "X-Api-Key": apiKey },
  })
  if (!response.ok) {
    throw new Error(`Sonarr sync failed: ${response.status}`)
  }
  const data = await response.json()
  return data.map((item: any) => {
    const hasEpisodes = Number(item?.statistics?.episodeFileCount || 0) > 0
    return {
      id: String(item.id ?? item.tvdbId ?? item.title),
      title: item.title,
      type: "tv" as const,
      year: item.year,
      quality: item.qualityProfileId ? `Profile ${item.qualityProfileId}` : "HD",
      status: hasEpisodes ? "available" : "processing",
      overview: item.overview,
      rating: formatRating(item?.ratings?.value),
      poster: getImageUrl(item.images, "poster"),
      backdrop: getImageUrl(item.images, "fanart") || getImageUrl(item.images, "banner"),
      path: item.path,
      tmdbId: item.tmdbId ?? undefined,
    }
  })
}

async function fetchRadarr(url: string, apiKey: string): Promise<LibraryItem[]> {
  const response = await fetch(`${url}/api/v3/movie`, {
    headers: { "X-Api-Key": apiKey },
  })
  if (!response.ok) {
    throw new Error(`Radarr sync failed: ${response.status}`)
  }
  const data = await response.json()
  return data.map((item: any) => {
    const hasFile = Boolean(item.hasFile || item.movieFile?.path)
    return {
      id: String(item.id ?? item.tmdbId ?? item.title),
      title: item.title,
      type: "movie" as const,
      year: item.year,
      quality: item.movieFile?.quality?.quality?.name || "HD",
      size: formatSize(item.movieFile?.size || item.sizeOnDisk),
      status: hasFile ? "available" : "processing",
      overview: item.overview,
      rating: formatRating(item?.ratings?.value),
      poster: getImageUrl(item.images, "poster"),
      backdrop: getImageUrl(item.images, "fanart") || getImageUrl(item.images, "poster"),
      runtime: item.runtime,
      path: item.movieFile?.path,
      tmdbId: item.tmdbId ?? undefined,
    }
  })
}

export async function POST() {
  const settings = await getSettings()
  const results = { movies: [] as LibraryItem[], tv: [] as LibraryItem[] }

  if (settings.radarr.enabled && settings.radarr.url && settings.radarr.apiKey) {
    results.movies = await fetchRadarr(settings.radarr.url, settings.radarr.apiKey)
  }

  if (settings.sonarr.enabled && settings.sonarr.url && settings.sonarr.apiKey) {
    results.tv = await fetchSonarr(settings.sonarr.url, settings.sonarr.apiKey)
  }

  const payload = { ...results, updatedAt: new Date().toISOString() }
  await saveLibrary(payload)

  return NextResponse.json(payload)
}
