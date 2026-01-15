import { NextResponse } from "next/server"
import { createReadStream } from "fs"
import { stat } from "fs/promises"
import path from "path"
import { lookup } from "mime-types"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getSettings } from "@/lib/settings"
import { streamTranscoded, needsTranscoding } from "@/lib/transcode"

function isPathAllowed(filePath: string, allowedRoots: string[]) {
  const resolvedPath = path.resolve(filePath)
  return allowedRoots.some((root) => {
    const resolvedRoot = path.resolve(root)
    return resolvedPath === resolvedRoot || resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)
  })
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  let filePath = searchParams.get("path")
  if (!filePath) {
    return new NextResponse("Missing path", { status: 400 })
  }

  const settings = await getSettings()
  
  // Map container paths to host paths (Radarr/Sonarr use /movies and /tv)
  if (filePath.startsWith("/movies/")) {
    filePath = filePath.replace("/movies/", `${settings.storage.moviesPath}/`)
  } else if (filePath.startsWith("/tv/")) {
    filePath = filePath.replace("/tv/", `${settings.storage.tvPath}/`)
  }

  const allowedRoots = [settings.storage.moviesPath, settings.storage.tvPath].filter(Boolean)
  if (allowedRoots.length > 0 && !isPathAllowed(filePath, allowedRoots)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const stats = await stat(filePath)
  const range = request.headers.get("range")
  const quality = searchParams.get("quality") || settings.transcoding.defaultQuality
  const contentType = (lookup(filePath) || "application/octet-stream").toString()

  // Check if this is a video file
  const isVideo = contentType.startsWith("video/")

  // Use transcoding if enabled and quality is requested
  if (
    isVideo &&
    settings.transcoding.enabled &&
    needsTranscoding(filePath, quality)
  ) {
    try {
      const { stream, headers, status } = await streamTranscoded(
        filePath,
        quality,
        range || undefined,
      )

      return new Response(stream as unknown as ReadableStream, {
        status,
        headers,
      })
    } catch (error: any) {
      console.error("Transcoding error:", error)
      // Fall back to original file if transcoding fails
    }
  }

  // Stream original file
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
    const start = Number(startStr)
    const end = endStr ? Number(endStr) : stats.size - 1
    if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
      return new NextResponse("Invalid range", { status: 416 })
    }
    const chunkSize = end - start + 1
    const stream = createReadStream(filePath, { start, end })
    return new Response(stream as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": contentType,
      },
    })
  }

  const stream = createReadStream(filePath)
  return new Response(stream as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Length": stats.size.toString(),
      "Content-Type": contentType,
    },
  })
}
