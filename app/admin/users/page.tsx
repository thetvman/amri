"use client"

import { useEffect, useState } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Shield, User, Mail, Calendar, KeyRound, Clipboard } from "lucide-react"

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminUsers() {
  const [invites, setInvites] = useState<any[]>([])
  const [inviteStatus, setInviteStatus] = useState<string>("")
  const [users, setUsers] = useState<UserRow[]>([])

  const loadInvites = async () => {
    const response = await fetch("/api/admin/invites")
    if (!response.ok) return
    const data = await response.json()
    setInvites(data)
  }

  useEffect(() => {
    loadInvites()
    const loadUsers = async () => {
      const response = await fetch("/api/admin/users")
      if (!response.ok) return
      const data = await response.json()
      setUsers(data)
    }
    loadUsers()
  }, [])

  const createInvite = async () => {
    setInviteStatus("Creating invite...")
    const response = await fetch("/api/admin/invites", { method: "POST" })
    if (!response.ok) {
      setInviteStatus("Failed to create invite")
      return
    }
    const invite = await response.json()
    setInvites((prev) => [invite, ...prev])
    setInviteStatus(`Invite ${invite.code} created`)
  }

  const copyInvite = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setInviteStatus(`Copied ${code}`)
  }
  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return <Badge className="bg-purple-600"><Shield className="h-3 w-3 mr-1" /> Admin</Badge>
    }
    return <Badge variant="secondary"><User className="h-3 w-3 mr-1" /> User</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="secondary">Inactive</Badge>
  }

  const updateUser = async (id: string, updates: Partial<UserRow>) => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!response.ok) return
    const updated = await response.json()
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updated } : user)))
  }

  const deleteUser = async (id: string) => {
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    if (!response.ok) return
    setUsers((prev) => prev.filter((user) => user.id !== id))
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">User Management</h2>
                <p className="text-muted-foreground">Manage users and their permissions</p>
              </div>
              <Button>Add User</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/60 backdrop-blur-lg border-border/40">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  {users.length} total users registered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "User"}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <select
                            value={user.role}
                            onChange={(event) => updateUser(user.id, { role: event.target.value })}
                            className="bg-card/60 border border-border/40 rounded-md px-2 py-1 text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                            >
                              {user.isActive ? "Disable" : "Enable"}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-card/60 backdrop-blur-lg border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Invite Codes
                </CardTitle>
                <CardDescription>Create and manage invite-only registration codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button onClick={createInvite}>Generate Invite</Button>
                  {inviteStatus && <span className="text-sm text-muted-foreground">{inviteStatus}</span>}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-mono">{invite.code}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{invite.usedAt ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {invite.usedBy?.email || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => copyInvite(invite.code)}>
                            <Clipboard className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={async () => {
                              await fetch(`/api/admin/invites/${invite.id}`, { method: "DELETE" })
                              setInvites((prev) => prev.filter((item) => item.id !== invite.id))
                            }}
                          >
                            Delete
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
