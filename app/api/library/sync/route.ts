import { NextResponse } from "next/server"
import { getSettings } from "@/lib/settings"
import { saveLibrary, type LibraryItem } from "@/lib/library"

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "N/A"
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

async function fetchSonarr(url: string, apiKey: string): Promise<LibraryItem[]> {
  const response = await fetch(`${url}/api/v3/series`, {
    headers: { "X-Api-Key": apiKey },
  })
  if (!response.ok) {
    throw new Error(`Sonarr sync failed: ${response.status}`)
  }
  const data = await response.json()
  return data.map((item: any) => ({
    id: String(item.id ?? item.tvdbId ?? item.title),
    title: item.title,
    type: "tv" as const,
    year: item.year,
    quality: item.qualityProfileId ? `Profile ${item.qualityProfileId}` : "HD",
    status: item.status || "available",
  }))
}

async function fetchRadarr(url: string, apiKey: string): Promise<LibraryItem[]> {
  const response = await fetch(`${url}/api/v3/movie`, {
    headers: { "X-Api-Key": apiKey },
  })
  if (!response.ok) {
    throw new Error(`Radarr sync failed: ${response.status}`)
  }
  const data = await response.json()
  return data.map((item: any) => ({
    id: String(item.id ?? item.tmdbId ?? item.title),
    title: item.title,
    type: "movie" as const,
    year: item.year,
    quality: item.movieFile?.quality?.quality?.name || "HD",
    size: formatSize(item.sizeOnDisk),
    status: item.status || "available",
  }))
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
