import { spawn } from "child_process"
import { createReadStream, existsSync, mkdirSync } from "fs"
import path from "path"
import { lookup } from "mime-types"

export interface TranscodeOptions {
  inputPath: string
  outputPath?: string
  quality: "1080p" | "720p" | "480p" | "360p" | "original"
  format?: "mp4" | "webm"
  startTime?: number
  duration?: number
}

export interface TranscodeProgress {
  percent: number
  time: number
  bitrate: string
  speed: string
}

// Check if file needs transcoding based on codec
export function needsTranscoding(filePath: string, targetQuality: string): boolean {
  // For now, always transcode if quality is requested and not original
  // In production, you'd probe the file to check codecs
  return targetQuality !== "original"
}

// Get FFmpeg path (will be installed via package)
function getFFmpegPath(): string | null {
  // Try to find ffmpeg in common locations
  const possiblePaths = [
    "ffmpeg", // System PATH
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/opt/homebrew/bin/ffmpeg",
    process.platform === "win32" ? "C:\\ffmpeg\\bin\\ffmpeg.exe" : undefined,
  ].filter(Boolean) as string[]

  for (const ffmpegPath of possiblePaths) {
    if (ffmpegPath === "ffmpeg") {
      // Check if ffmpeg is in PATH by trying to spawn it
      try {
        const { execSync } = require("child_process")
        execSync("which ffmpeg", { stdio: "ignore" })
        return "ffmpeg"
      } catch {
        continue
      }
    }
    if (existsSync(ffmpegPath)) {
      return ffmpegPath
    }
  }

  return null
}

// Get quality settings
function getQualitySettings(quality: string) {
  const settings: Record<string, { videoBitrate: string; resolution: string; audioBitrate: string }> = {
    "1080p": {
      videoBitrate: "5000k",
      resolution: "1920:1080",
      audioBitrate: "192k",
    },
    "720p": {
      videoBitrate: "2500k",
      resolution: "1280:720",
      audioBitrate: "128k",
    },
    "480p": {
      videoBitrate: "1000k",
      resolution: "854:480",
      audioBitrate: "96k",
    },
    "360p": {
      videoBitrate: "500k",
      resolution: "640:360",
      audioBitrate: "64k",
    },
  }

  return settings[quality] || settings["720p"]
}

// Transcode video file
export async function transcodeVideo(
  options: TranscodeOptions,
  onProgress?: (progress: TranscodeProgress) => void,
): Promise<string> {
  const { inputPath, quality, format = "mp4", startTime, duration } = options

  if (quality === "original") {
    return inputPath
  }

  const qualitySettings = getQualitySettings(quality)
  const outputDir = path.join(process.cwd(), ".transcode-cache")
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const inputHash = Buffer.from(inputPath).toString("base64").replace(/[^a-zA-Z0-9]/g, "")
  const outputPath =
    options.outputPath ||
    path.join(outputDir, `${inputHash}-${quality}.${format}`)

  // If already transcoded, return cached path
  if (existsSync(outputPath)) {
    return outputPath
  }

  const ffmpegPath = getFFmpegPath()
  if (!ffmpegPath) {
    throw new Error("FFmpeg not found. Please install FFmpeg: sudo apt install ffmpeg")
  }
  
  const args: string[] = [
    "-i",
    inputPath,
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-maxrate",
    qualitySettings.videoBitrate,
    "-bufsize",
    `${parseInt(qualitySettings.videoBitrate) * 2}k`,
    "-vf",
    `scale=${qualitySettings.resolution}:force_original_aspect_ratio=decrease`,
    "-c:a",
    "aac",
    "-b:a",
    qualitySettings.audioBitrate,
    "-movflags",
    "+faststart",
    "-f",
    format,
    "-y",
    outputPath,
  ]

  if (startTime !== undefined) {
    args.splice(1, 0, "-ss", startTime.toString())
  }

  if (duration !== undefined) {
    args.push("-t", duration.toString())
  }

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, args)

    let stderr = ""

    ffmpeg.stderr.on("data", (data: Buffer) => {
      stderr += data.toString()
      
      // Parse progress
      const progressMatch = stderr.match(/time=(\d+:\d+:\d+\.\d+).*bitrate=\s*(\d+\.?\d*)\w+.*speed=\s*(\d+\.?\d*)x/)
      if (progressMatch && onProgress) {
        const [, timeStr, bitrate, speed] = progressMatch
        const [hours, minutes, seconds] = timeStr.split(":").map(Number)
        const totalSeconds = hours * 3600 + minutes * 60 + seconds

        onProgress({
          percent: 0, // Would need duration to calculate
          time: totalSeconds,
          bitrate: `${bitrate} kbps`,
          speed: `${speed}x`,
        })
      }
    })

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath)
      } else {
        reject(new Error(`FFmpeg failed with code ${code}: ${stderr.slice(-500)}`))
      }
    })

    ffmpeg.on("error", (error) => {
      reject(error)
    })
  })
}

// Stream transcoded video with range support
export async function streamTranscoded(
  inputPath: string,
  quality: string,
  range?: string,
): Promise<{ stream: NodeJS.ReadableStream; headers: Record<string, string>; status: number }> {
  if (quality === "original") {
    // Stream original file
    const { createReadStream } = await import("fs")
    const { stat } = await import("fs/promises")
    const stats = await stat(inputPath)
    const contentType = (lookup(inputPath) || "video/mp4").toString()

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
      const start = Number(startStr)
      const end = endStr ? Number(endStr) : stats.size - 1
      const chunkSize = end - start + 1

      return {
        stream: createReadStream(inputPath, { start, end }),
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
        },
        status: 206,
      }
    }

    return {
      stream: createReadStream(inputPath),
      headers: {
        "Content-Length": stats.size.toString(),
        "Content-Type": contentType,
      },
      status: 200,
    }
  }

  // Check if FFmpeg is available
  const ffmpegPath = getFFmpegPath()
  if (!ffmpegPath) {
    // FFmpeg not found, stream original file
    const { createReadStream } = await import("fs")
    const { stat } = await import("fs/promises")
    const stats = await stat(inputPath)
    const contentType = (lookup(inputPath) || "video/mp4").toString()

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
      const start = Number(startStr)
      const end = endStr ? Number(endStr) : stats.size - 1
      const chunkSize = end - start + 1

      return {
        stream: createReadStream(inputPath, { start, end }),
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
        },
        status: 206,
      }
    }

    return {
      stream: createReadStream(inputPath),
      headers: {
        "Content-Length": stats.size.toString(),
        "Content-Type": contentType,
      },
      status: 200,
    }
  }

  // Transcode on-demand
  try {
    const outputPath = await transcodeVideo({
      inputPath,
      quality: quality as any,
    })

    const { createReadStream } = await import("fs")
    const { stat } = await import("fs/promises")
    const stats = await stat(outputPath)
    const contentType = "video/mp4"

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
      const start = Number(startStr)
      const end = endStr ? Number(endStr) : stats.size - 1
      const chunkSize = end - start + 1

      return {
        stream: createReadStream(outputPath, { start, end }),
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
        },
        status: 206,
      }
    }

    return {
      stream: createReadStream(outputPath),
      headers: {
        "Content-Length": stats.size.toString(),
        "Content-Type": contentType,
      },
      status: 200,
    }
  } catch (error: any) {
    throw new Error(`Transcoding failed: ${error.message}`)
  }
}
