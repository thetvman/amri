"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DisabledPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg text-center px-6"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Account Disabled</h1>
        <p className="text-muted-foreground mb-6">
          Your account has been disabled. Please contact an administrator to restore access.
        </p>
        <Link href="/login">
          <Button variant="outline">Return to Login</Button>
        </Link>
      </motion.div>
    </div>
  )
}
