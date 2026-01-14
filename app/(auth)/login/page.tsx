"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    })

    if (result?.error) {
      setError("Invalid email or password.")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          amriM
        </h1>
        <p className="text-muted-foreground mt-2">Welcome back to your private media server</p>
      </div>

      <Card className="bg-card/60 backdrop-blur-lg border-border/40">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your family media library</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border/40" />
                Remember me
              </label>
              <Link href="#" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" type="submit">
              Sign in
            </Button>
            <Button variant="outline" className="w-full" type="button">
              Continue as guest
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
