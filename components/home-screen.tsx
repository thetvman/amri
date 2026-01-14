"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AppHeader } from "@/components/app-header"
import { SearchBar } from "@/components/search-bar"
import { UserActions } from "@/components/user-actions"
import { MediaBrowser } from "@/components/media-browser"
import type { MediaItem } from "@/lib/tmdb"

interface HomeScreenProps {
  items: MediaItem[]
  title: string
  subtitle: string
  showCategoryFilter?: boolean
  defaultCategory?: "all" | "movies" | "tv"
}

export function HomeScreen({
  items,
  title,
  subtitle,
  showCategoryFilter = true,
  defaultCategory = "all",
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        rightSlot={
          <>
            <SearchBar onSearch={setSearchQuery} />
            <UserActions />
          </>
        }
      />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          </motion.div>

          <MediaBrowser
            items={items}
            searchQuery={searchQuery}
            showCategoryFilter={showCategoryFilter}
            defaultCategory={defaultCategory}
          />
        </div>
      </main>
    </div>
  )
}
