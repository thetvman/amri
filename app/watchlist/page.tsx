"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { MovieCard } from "@/components/movie-card"
import { UserActions } from "@/components/user-actions"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface WatchlistItem {
  id: string
  tmdbId: string
  type: "movie" | "tv"
}

export default function WatchlistPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
      return
    }
    if (sessionStatus === "authenticated") {
      loadWatchlist()
    }
  }, [sessionStatus, router])

  const loadWatchlist = async () => {
    try {
      const response = await fetch("/api/watchlist")
      if (response.ok) {
        const watchlist: WatchlistItem[] = await response.json()
        
        // Fetch details for each item from TMDB via API
        const details = await Promise.all(
          watchlist.map(async (item) => {
            try {
              const detailsRes = await fetch(`/api/tmdb/details?id=${item.tmdbId}&type=${item.type}`)
              if (detailsRes.ok) {
                const details = await detailsRes.json()
                return {
                  id: item.tmdbId,
                  title: details.title,
                  year: details.year,
                  rating: details.rating,
                  genre: details.genre,
                  poster: details.poster,
                  type: item.type,
                }
              }
              return null
            } catch (error) {
              console.error(`Failed to load details for ${item.tmdbId}:`, error)
              return null
            }
          })
        )

        setItems(details.filter(Boolean))
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader rightSlot={<UserActions />} />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">My Watchlist</h2>
            <p className="text-muted-foreground">Saved titles you want to watch later</p>
          </motion.div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Your watchlist is empty</p>
              <p className="text-muted-foreground text-sm mt-2">
                Add titles to your watchlist from the library or search
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
