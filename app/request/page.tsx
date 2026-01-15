"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { UserActions } from "@/components/user-actions"
import { motion } from "framer-motion"
import { Plus, Film, Tv, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  tmdbId: string
  title: string
  type: "movie" | "tv"
  year?: string
  poster?: string | null
}

interface UserRequest {
  id: string
  title: string
  type: "movie" | "tv"
  year?: number
  status: "pending" | "approved" | "denied"
  requestedAt: string
  approvedAt?: string | null
  deniedAt?: string | null
}

export default function RequestPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [userRequests, setUserRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
      return
    }
    if (sessionStatus === "authenticated") {
      loadUserRequests()
    }
  }, [sessionStatus, router])

  const loadUserRequests = async () => {
    try {
      const response = await fetch("/api/requests")
      if (response.ok) {
        const data = await response.json()
        setUserRequests(data)
      }
    } catch (error) {
      console.error("Failed to load requests:", error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      setSearching(true)
      try {
        const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.results || [])
        }
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setSearching(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const handleRequest = async (item: SearchResult) => {
    if (!session?.user) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.tmdbId,
          title: item.title,
          type: item.type,
          year: item.year ? parseInt(item.year) : null,
          poster: item.poster,
        }),
      })

      if (response.ok) {
        await loadUserRequests()
        setSearchQuery("")
        setSearchResults([])
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit request")
      }
    } catch (error) {
      console.error("Request failed:", error)
      alert("Failed to submit request")
    } finally {
      setLoading(false)
    }
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

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        rightSlot={
          <>
            <SearchBar onSearch={handleSearch} />
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
                  {searching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {searchResults.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.05 }}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card/40 border border-border/40">
                            <img
                              src={item.poster || "/placeholder.svg"}
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
                                  disabled={loading}
                                  className="w-full"
                                >
                                  {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Request
                                    </>
                                  )}
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
                {userRequests.length > 0 ? (
                  <div className="space-y-4">
                    {userRequests.map((request) => (
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
                              {request.type === "movie" ? "Movie" : "TV Show"} • {request.year || "N/A"} • Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No requests yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
