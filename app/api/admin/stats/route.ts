import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getLibrary } from "@/lib/library"
import { getSettings } from "@/lib/settings"
import { stat } from "fs/promises"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [users, activeUsers, requests, library, settings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.request.count({ where: { status: "pending" } }),
    getLibrary(),
    getSettings(),
  ])

  // Calculate storage
  let storageUsed = 0
  let storageTotal = 0
  try {
    if (settings.storage.moviesPath) {
      const stats = await stat(settings.storage.moviesPath).catch(() => null)
      // This is a simplified check - in production you'd want to calculate actual disk usage
    }
    // For now, return placeholder values
    storageUsed = 0
    storageTotal = 0
  } catch (error) {
    // Ignore storage errors
  }

  const stats = {
    totalUsers: users,
    activeUsers,
    pendingRequests: requests,
    totalMovies: library.movies.length,
    totalTVShows: library.tv.length,
    storageUsed: storageUsed.toFixed(1),
    storageTotal: storageTotal.toFixed(1) || "0",
  }

  return NextResponse.json(stats)
}
