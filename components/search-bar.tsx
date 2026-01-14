"use client"

import type React from "react"
import { useState } from "react"
import { Search, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <motion.div
        className="relative"
        animate={{
          width: isFocused || query ? 320 : 240,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search movies & TV shows..."
          suppressHydrationWarning
          className="w-full pl-10 pr-10 py-2 rounded-xl bg-card/60 backdrop-blur-lg border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  )
}
