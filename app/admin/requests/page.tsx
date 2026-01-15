"use client"

import { useState, useEffect } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Clock, Film, Tv, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Request {
  id: string
  title: string
  type: "movie" | "tv"
  year?: number | null
  status: "pending" | "approved" | "denied"
  requestedAt: string
  requester: {
    name: string | null
    email: string
  }
}

export default function AdminRequests() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
      return
    }
    if (sessionStatus === "authenticated" && session?.user?.role === "admin") {
      loadRequests()
    }
  }, [sessionStatus, session, router])

  const loadRequests = async () => {
    try {
      const response = await fetch("/api/requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Failed to load requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      if (response.ok) {
        await loadRequests()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to approve request")
      }
    } catch (error) {
      console.error("Failed to approve:", error)
      alert("Failed to approve request")
    } finally {
      setProcessing(null)
    }
  }

  const handleDeny = async (id: string) => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "denied" }),
      })

      if (response.ok) {
        await loadRequests()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to deny request")
      }
    } catch (error) {
      console.error("Failed to deny:", error)
      alert("Failed to deny request")
    } finally {
      setProcessing(null)
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

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

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
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  {pendingRequests.length} pending requests awaiting review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length > 0 ? (
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
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.requester.name || request.requester.email}
                          </TableCell>
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
                          <TableCell>{request.year || "N/A"}</TableCell>
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
                                  disabled={processing === request.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {processing === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeny(request.id)}
                                  disabled={processing === request.id}
                                >
                                  {processing === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Deny
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No requests found</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
