"use client"

import { motion } from "framer-motion"
import { Star, Play } from "lucide-react"
import Link from "next/link"

interface MovieCardProps {
  movie: {
    id: string
    title: string
    year?: number
    rating: string
    genre: string
    poster: string
    type: "movie" | "tv"
  }
  index: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function MovieCard({ movie, index }: MovieCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/watch/${movie.id}?type=${movie.type}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card/40 backdrop-blur-lg border border-border/40 shadow-lg">
          <img
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-lg flex items-center justify-center border-2 border-primary">
              <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">{movie.rating}</span>
              {movie.year && <span className="text-sm text-muted-foreground">• {movie.year}</span>}
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3">
        <h3 className="font-semibold truncate text-foreground">{movie.title}</h3>
        <p className="text-sm text-muted-foreground">{movie.genre}</p>
      </div>
    </motion.div>
  )
}
