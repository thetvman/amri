import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const isAdmin = session.user.role === "admin"

  const where: any = {}
  if (!isAdmin) {
    where.requestedBy = session.user.id
  }
  if (status) {
    where.status = status
  }

  const requests = await prisma.request.findMany({
    where,
    include: {
      requester: {
        select: { id: true, name: true, email: true },
      },
      approver: {
        select: { id: true, name: true, email: true },
      },
      denier: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(requests)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { tmdbId, title, type, year, poster } = body

  if (!tmdbId || !title || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Check if already requested
  const existing = await prisma.request.findFirst({
    where: {
      tmdbId,
      type,
      status: { in: ["pending", "approved"] },
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Already requested or approved" }, { status: 409 })
  }

  const newRequest = await prisma.request.create({
    data: {
      tmdbId,
      title,
      type,
      year: year ? parseInt(String(year)) : null,
      poster: poster || null,
      requestedBy: session.user.id,
      status: "pending",
    },
    include: {
      requester: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return NextResponse.json(newRequest)
}
