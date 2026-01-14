"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { MediaDetails } from "@/lib/tmdb"

interface WatchDetailsProps {
  details: MediaDetails
}

export function WatchDetails({ details }: WatchDetailsProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${details.backdrop})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster and Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card/40 backdrop-blur-lg border border-border/40 shadow-lg">
                  <img src={details.poster} alt={details.title} className="w-full h-full object-cover" />
                </div>
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
              >
                <div>
                  <h1 className="text-4xl font-bold mb-2">{details.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <span>{details.year ?? "N/A"}</span>
                    <span>•</span>
                    <span>{details.duration}</span>
                    <span>•</span>
                    <span>{details.quality}</span>
                    <span>•</span>
                    <span className="text-yellow-500">★ {details.rating}</span>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">{details.description}</p>
                </div>

                <div className="flex gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Play className="h-5 w-5 mr-2" fill="currentColor" />
                    Play Now
                  </Button>
                  <Button size="lg" variant="outline">
                    Add to Watchlist
                  </Button>
                </div>

                <div className="pt-6 border-t border-border/40">
                  <h3 className="text-lg font-semibold mb-4">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Genre:</span>
                      <p className="font-medium">{details.genre}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{details.type === "movie" ? "Movie" : "TV Show"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
