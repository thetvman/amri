import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getSettings } from "@/lib/settings"

async function addToRadarr(tmdbId: string, title: string, year?: number) {
  const settings = await getSettings()
  if (!settings.radarr.enabled || !settings.radarr.url || !settings.radarr.apiKey) {
    throw new Error("Radarr not configured")
  }

  const response = await fetch(`${settings.radarr.url}/api/v3/movie`, {
    method: "POST",
    headers: {
      "X-Api-Key": settings.radarr.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tmdbId: parseInt(tmdbId),
      title,
      year: year || new Date().getFullYear(),
      qualityProfileId: 1,
      rootFolderPath: "/movies",
      monitored: true,
      addOptions: {
        searchForMovie: true,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Radarr error: ${error}`)
  }

  return response.json()
}

async function addToSonarr(tmdbId: string, title: string, year?: number) {
  const settings = await getSettings()
  if (!settings.sonarr.enabled || !settings.sonarr.url || !settings.sonarr.apiKey) {
    throw new Error("Sonarr not configured")
  }

  const response = await fetch(`${settings.sonarr.url}/api/v3/series`, {
    method: "POST",
    headers: {
      "X-Api-Key": settings.sonarr.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tmdbId: parseInt(tmdbId),
      title,
      year: year || new Date().getFullYear(),
      qualityProfileId: 1,
      rootFolderPath: "/tv",
      monitored: true,
      addOptions: {
        searchForMissingEpisodes: true,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Sonarr error: ${error}`)
  }

  return response.json()
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status } = body

  if (!["approved", "denied"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const requestRecord = await prisma.request.findUnique({
    where: { id },
  })

  if (!requestRecord) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  const updateData: any = {
    status,
    updatedAt: new Date(),
  }

  if (status === "approved") {
    updateData.approvedBy = session.user.id
    updateData.approvedAt = new Date()
    updateData.deniedBy = null
    updateData.deniedAt = null

    // Add to Radarr/Sonarr
    try {
      if (requestRecord.type === "movie") {
        await addToRadarr(requestRecord.tmdbId, requestRecord.title, requestRecord.year || undefined)
      } else if (requestRecord.type === "tv") {
        await addToSonarr(requestRecord.tmdbId, requestRecord.title, requestRecord.year || undefined)
      }
    } catch (error: any) {
      // Still mark as approved even if Radarr/Sonarr fails
      console.error("Failed to add to Radarr/Sonarr:", error.message)
    }
  } else {
    updateData.deniedBy = session.user.id
    updateData.deniedAt = new Date()
    updateData.approvedBy = null
    updateData.approvedAt = null
  }

  const updated = await prisma.request.update({
    where: { id },
    data: updateData,
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
  })

  return NextResponse.json(updated)
}
