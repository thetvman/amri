import { NextResponse } from "next/server"
import { getMediaDetails } from "@/lib/tmdb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const type = searchParams.get("type") as "movie" | "tv" | undefined

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    const details = await getMediaDetails(id, type)
    if (!details) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(details)
  } catch (error: any) {
    console.error("TMDB details error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch details" }, { status: 500 })
  }
}
