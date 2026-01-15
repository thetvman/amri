"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Play, Tv } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface LibraryWatchDetailsProps {
  item: {
    id: string
    title: string
    type: "movie" | "tv"
    year?: number
    rating?: string
    overview?: string
    genre?: string
    poster?: string
    backdrop?: string
    runtime?: number
    quality?: string
    path?: string
  }
}

interface EpisodeItem {
  id: string
  title: string
  seasonNumber: number
  episodeNumber: number
  airDate?: string
  path: string
  quality: string
  size: string
}

export function LibraryWatchDetails({ item }: LibraryWatchDetailsProps) {
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeItem | null>(null)

  useEffect(() => {
    if (item.type !== "tv") return
    const loadEpisodes = async () => {
      const response = await fetch(`/api/library/tv/${item.id}/episodes`)
      const data = await response.json()
      setEpisodes(data.episodes || [])
    }
    loadEpisodes()
  }, [item.id, item.type])

  const streamPath = item.type === "movie" ? item.path : selectedEpisode?.path
  const streamUrl = useMemo(
    () => (streamPath ? `/api/stream?path=${encodeURIComponent(streamPath)}` : ""),
    [streamPath],
  )

  const durationLabel = item.runtime ? `${item.runtime} min` : "N/A"
  const ratingLabel = item.rating || "N/A"
  const description = item.overview || "No description available."
  const poster = item.poster || "/placeholder.svg"
  const backdrop = item.backdrop || "/placeholder.svg"

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdrop})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="relative z-10 min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="container mx-auto px-4 py-4">
            <Link href={item.type === "tv" ? "/library/tv" : "/library/movies"}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card/40 backdrop-blur-lg border border-border/40 shadow-lg">
                  <img src={poster} alt={item.title} className="w-full h-full object-cover" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
              >
                <div>
                  <h1 className="text-4xl font-bold mb-2">{item.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <span>{item.year ?? "N/A"}</span>
                    <span>•</span>
                    <span>{durationLabel}</span>
                    <span>•</span>
                    <span>{item.quality || "HD"}</span>
                    <span>•</span>
                    <span className="text-yellow-500">★ {ratingLabel}</span>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">{description}</p>
                </div>

                {item.type === "movie" && (
                  <div className="flex gap-4">
                    <Button size="lg" className="bg-primary hover:bg-primary/90" disabled={!streamUrl}>
                      <Play className="h-5 w-5 mr-2" fill="currentColor" />
                      {streamUrl ? "Play Now" : "File not available"}
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {streamUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <video
                  className="w-full rounded-xl border border-border/40 bg-black"
                  src={streamUrl}
                  controls
                />
              </motion.div>
            )}

            {item.type === "tv" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-2 mb-4">
                  <Tv className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Episodes</h3>
                </div>
                {episodes.length === 0 ? (
                  <p className="text-muted-foreground">No downloaded episodes found yet.</p>
                ) : (
                  <div className="grid gap-3">
                    {episodes.map((episode) => {
                      const label = `S${episode.seasonNumber.toString().padStart(2, "0")}E${episode.episodeNumber
                        .toString()
                        .padStart(2, "0")}`
                      return (
                        <button
                          key={episode.id}
                          onClick={() => setSelectedEpisode(episode)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            selectedEpisode?.id === episode.id
                              ? "border-primary bg-primary/10"
                              : "border-border/40 bg-card/40 hover:bg-card/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-semibold">
                                {label} • {episode.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {episode.quality} • {episode.size}
                              </div>
                            </div>
                            <span className="text-sm text-primary">Play</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
