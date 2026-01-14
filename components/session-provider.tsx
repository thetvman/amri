"use client"

import { SessionProvider } from "next-auth/react"
import { AccountStatusGuard } from "./status-guard"

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AccountStatusGuard>{children}</AccountStatusGuard>
    </SessionProvider>
  )
}
