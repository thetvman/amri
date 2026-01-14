"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { UserActions } from "@/components/user-actions"
import { motion } from "framer-motion"
import { Plus, Film, Tv, Clock, CheckCircle, XCircle } from "lucide-react"

// Mock search results
const mockSearchResults = [
  { id: "1", title: "Dune: Part Two", year: 2024, type: "movie" as const, poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" },
  { id: "2", title: "The Last of Us", year: 2023, type: "tv" as const, poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg" },
  { id: "3", title: "Oppenheimer", year: 2023, type: "movie" as const, poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XLDykFvphP6x8TTY.jpg" },
]

// Mock user requests
const mockUserRequests = [
  { id: "1", title: "Dune: Part Two", type: "movie" as const, year: 2024, status: "pending" as const, requestedAt: "2024-01-15" },
  { id: "2", title: "The Last of Us", type: "tv" as const, year: 2023, status: "approved" as const, requestedAt: "2024-01-10" },
  { id: "3", title: "Oppenheimer", type: "movie" as const, year: 2023, status: "denied" as const, requestedAt: "2024-01-05" },
]

export default function RequestPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof mockSearchResults>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      setSearchResults(mockSearchResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      ))
    } else {
      setSearchResults([])
    }
  }

  const handleRequest = (item: typeof mockSearchResults[0]) => {
    console.log("Request content:", item)
    // In real app, this would make an API call
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
      case "denied":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Denied</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader
        rightSlot={
          <>
            <SearchBar onSearch={handleSearch} />
            <UserActions />
          </>
        }
      />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">Request Content</h2>
            <p className="text-muted-foreground">Search and request movies or TV shows to be added to the library</p>
          </motion.div>

          {/* Search Results */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>Click to request content</CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.05 }}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card/40 border border-border/40">
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  {item.type === "movie" ? (
                                    <Film className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Tv className="h-4 w-4 text-primary" />
                                  )}
                                  <Badge variant="outline">{item.type}</Badge>
                                </div>
                                <h3 className="font-semibold mb-2">{item.title}</h3>
                                <Button
                                  size="sm"
                                  onClick={() => handleRequest(item)}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Request
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No results found</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* User Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/60 backdrop-blur-lg border-border/40">
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>Track the status of your content requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUserRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-border/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          {request.type === "movie" ? (
                            <Film className="h-6 w-6 text-primary" />
                          ) : (
                            <Tv className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type === "movie" ? "Movie" : "TV Show"} • {request.year} • Requested {request.requestedAt}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
