import { NextResponse } from "next/server"

const TMDB_API_BASE = "https://api.themoviedb.org/3"

function getApiKey() {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured")
  }
  return apiKey
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const type = searchParams.get("type") || "multi"

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = getApiKey()
  let url = ""

  if (type === "multi") {
    url = `${TMDB_API_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  } else if (type === "movie") {
    url = `${TMDB_API_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  } else if (type === "tv") {
    url = `${TMDB_API_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }

  try {
    const response = await fetch(url, { next: { revalidate: 300 } })
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }
    const data = await response.json()

    const results = data.results
      .filter((item: any) => {
        if (type === "multi") {
          return item.media_type === "movie" || item.media_type === "tv"
        }
        return true
      })
      .map((item: any) => {
        const isMovie = type === "movie" || (type === "multi" && item.media_type === "movie")
        return {
          id: String(item.id),
          tmdbId: String(item.id),
          title: isMovie ? item.title : item.name,
          type: isMovie ? "movie" : "tv",
          year: isMovie
            ? item.release_date?.split("-")[0]
            : item.first_air_date?.split("-")[0],
          poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
        }
      })
      .slice(0, 20)

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error("TMDB search error:", error)
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 })
  }
}
