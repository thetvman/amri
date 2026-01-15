import { NextResponse } from "next/server"
import { getSettings } from "@/lib/settings"

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "N/A"
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const settings = await getSettings()
  if (!settings.sonarr.enabled || !settings.sonarr.url || !settings.sonarr.apiKey) {
    return NextResponse.json({ episodes: [] })
  }

  const headers = { "X-Api-Key": settings.sonarr.apiKey }
  const [episodesRes, filesRes] = await Promise.all([
    fetch(`${settings.sonarr.url}/api/v3/episode?seriesId=${id}`, { headers }),
    fetch(`${settings.sonarr.url}/api/v3/episodefile?seriesId=${id}`, { headers }),
  ])

  if (!episodesRes.ok || !filesRes.ok) {
    return NextResponse.json({ episodes: [] }, { status: 200 })
  }

  const episodes = await episodesRes.json()
  const files = await filesRes.json()
  const fileById = new Map<number, any>(files.map((file: any) => [file.id, file]))

  const results = episodes
    .filter((episode: any) => episode.episodeFileId)
    .map((episode: any) => {
      const file = fileById.get(episode.episodeFileId)
      return {
        id: String(episode.id),
        title: episode.title,
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        airDate: episode.airDate,
        path: file?.path,
        quality: file?.quality?.quality?.name || "HD",
        size: formatSize(file?.size),
      }
    })
    .filter((episode: any) => Boolean(episode.path))

  return NextResponse.json({ episodes: results })
}
