"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, inviteCode }),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error || "Registration failed.")
      return
    }

    setSuccess("Account created! You can now sign in.")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          amriM
        </h1>
        <p className="text-muted-foreground mt-2">Create your family account</p>
      </div>

      <Card className="bg-card/60 backdrop-blur-lg border-border/40">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Request access to your private media server</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite">Invite code</Label>
              <Input
                id="invite"
                type="text"
                placeholder="INVITE-CODE"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="rounded border-border/40" required />
              I agree to the private media usage guidelines
            </label>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" type="submit">
              Create account
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
