"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MovieCard } from "@/components/movie-card"
import type { MediaItem } from "@/lib/tmdb"

interface MediaBrowserProps {
  items: MediaItem[]
  searchQuery: string
  showCategoryFilter?: boolean
  defaultCategory?: "all" | "movies" | "tv"
}

export function MediaBrowser({
  items,
  searchQuery,
  showCategoryFilter = true,
  defaultCategory = "all",
}: MediaBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "movies" | "tv">(defaultCategory)

  const filteredContent = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(query)
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "movies" && item.type === "movie") ||
        (selectedCategory === "tv" && item.type === "tv")
      return matchesSearch && matchesCategory
    })
  }, [items, searchQuery, selectedCategory])

  return (
    <>
      {showCategoryFilter && (
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card/60 text-muted-foreground hover:bg-card/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("movies")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedCategory === "movies"
                ? "bg-primary text-primary-foreground"
                : "bg-card/60 text-muted-foreground hover:bg-card/80"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setSelectedCategory("tv")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedCategory === "tv"
                ? "bg-primary text-primary-foreground"
                : "bg-card/60 text-muted-foreground hover:bg-card/80"
            }`}
          >
            TV Shows
          </button>
        </div>
      )}

      {filteredContent.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          {filteredContent.map((media, index) => (
            <MovieCard key={media.id} movie={media} index={index} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No content found</p>
        </div>
      )}
    </>
  )
}
