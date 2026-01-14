"use client"

import { MenuBar } from "@/components/menu-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Clock, Film, Tv } from "lucide-react"

// Mock requests data
const mockRequests = [
  {
    id: "1",
    user: "John Doe",
    title: "Dune: Part Two",
    type: "movie" as const,
    year: 2024,
    status: "pending" as const,
    requestedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    user: "Jane Smith",
    title: "The Last of Us",
    type: "tv" as const,
    year: 2023,
    status: "pending" as const,
    requestedAt: "2024-01-15T08:15:00Z",
  },
  {
    id: "3",
    user: "Mike Johnson",
    title: "Oppenheimer",
    type: "movie" as const,
    year: 2023,
    status: "approved" as const,
    requestedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "4",
    user: "Sarah Williams",
    title: "House of the Dragon",
    type: "tv" as const,
    year: 2022,
    status: "denied" as const,
    requestedAt: "2024-01-13T16:45:00Z",
  },
]

export default function AdminRequests() {
  const handleApprove = (id: string) => {
    console.log("Approve request:", id)
  }

  const handleDeny = (id: string) => {
    console.log("Deny request:", id)
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                amriM Admin
              </h1>
              <MenuBar isAdmin={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">Content Requests</h2>
            <p className="text-muted-foreground">Review and manage user content requests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/60 backdrop-blur-lg border-border/40">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  {mockRequests.filter(r => r.status === "pending").length} requests awaiting review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.user}</TableCell>
                        <TableCell>{request.title}</TableCell>
                        <TableCell>
                          {request.type === "movie" ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Film className="h-3 w-3" /> Movie
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Tv className="h-3 w-3" /> TV Show
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{request.year}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeny(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Deny
                              </Button>
                            </div>
                          )}
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
