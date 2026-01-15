import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(watchlist)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { tmdbId, type } = body

  if (!tmdbId || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const watchlistItem = await prisma.watchlist.upsert({
      where: {
        userId_tmdbId_type: {
          userId: session.user.id,
          tmdbId: String(tmdbId),
          type,
        },
      },
      create: {
        userId: session.user.id,
        tmdbId: String(tmdbId),
        type,
      },
      update: {},
    })

    return NextResponse.json(watchlistItem)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add to watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tmdbId = searchParams.get("tmdbId")
  const type = searchParams.get("type")

  if (!tmdbId || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  await prisma.watchlist.deleteMany({
    where: {
      userId: session.user.id,
      tmdbId: String(tmdbId),
      type,
    },
  })

  return NextResponse.json({ success: true })
}
