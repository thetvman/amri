"use client"

import { AppHeader } from "@/components/app-header"
import { MovieCard } from "@/components/movie-card"
import { UserActions } from "@/components/user-actions"
import { motion } from "framer-motion"

const watchlistItems = [
  {
    id: "101",
    title: "Blade Runner 2049",
    year: 2017,
    rating: "8.0",
    genre: "Sci-Fi, Thriller",
    poster: "https://image.tmdb.org/t/p/w500/aMpyrCizvSdc0UIMblJ1srVgAEF.jpg",
    type: "movie" as const,
  },
  {
    id: "102",
    title: "The Bear",
    year: 2022,
    rating: "8.6",
    genre: "Comedy, Drama",
    poster: "https://image.tmdb.org/t/p/w500/9R0d2v0vS0r8b1yD9ZfJ5GQgVQp.jpg",
    type: "tv" as const,
  },
  {
    id: "103",
    title: "The Batman",
    year: 2022,
    rating: "7.8",
    genre: "Action, Crime",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    type: "movie" as const,
  },
  {
    id: "104",
    title: "Severance",
    year: 2022,
    rating: "8.7",
    genre: "Drama, Sci-Fi",
    poster: "https://image.tmdb.org/t/p/w500/pmTj1KwGzKJI6C8elV8h5C3p2gv.jpg",
    type: "tv" as const,
  },
]

export default function WatchlistPage() {
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlistItems.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
