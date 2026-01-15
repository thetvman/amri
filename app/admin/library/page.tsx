"use client"

import { useEffect, useState } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Film, Tv, RefreshCw, FolderPlus } from "lucide-react"
import Link from "next/link"

interface LibraryItem {
  id: string
  title: string
  type: "movie" | "tv"
  year?: number
  quality?: string
  size?: string
  status?: string
}

export default function AdminLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [syncStatus, setSyncStatus] = useState<string>("")

  const loadLibrary = async () => {
    const data = await fetch("/api/library").then((res) => res.json())
    setItems([...(data.movies || []), ...(data.tv || [])])
  }

  useEffect(() => {
    loadLibrary()
  }, [])

  const handleSync = async () => {
    setSyncStatus("Syncing...")
    const response = await fetch("/api/library/sync", { method: "POST" })
    const data = await response.json()
    setItems([...(data.movies || []), ...(data.tv || [])])
    setSyncStatus("Sync complete")
  }

  const getStatusBadge = (status: string) => {
    if (status === "available") return <Badge variant="default">Available</Badge>
    return <Badge variant="secondary">Processing</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                amriM Admin
              </h1>
              <MenuBar isAdmin={true} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan Library
              </Button>
              <Button size="sm" onClick={handleSync}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
              {syncStatus && <span className="text-xs text-muted-foreground">{syncStatus}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">Library Management</h2>
            <p className="text-muted-foreground">Monitor available content and processing jobs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/60 backdrop-blur-lg border-border/40">
              <CardHeader>
                <CardTitle>Library Items</CardTitle>
                <CardDescription>{items.length} items in the library</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          {item.type === "movie" ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Film className="h-3 w-3" /> Movie
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Tv className="h-3 w-3" /> TV Show
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.year}</TableCell>
                        <TableCell>{item.quality}</TableCell>
                        <TableCell>{item.size}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/watch/${item.id}?type=${item.type}&source=library`}>
                              {item.status === "available" ? "Play" : "View"}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
