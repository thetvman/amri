"use client"

import type React from "react"
import { MenuBar } from "@/components/menu-bar"

interface AppHeaderProps {
  title?: string
  isAdmin?: boolean
  rightSlot?: React.ReactNode
}

export function AppHeader({ title = "amriM", isAdmin = false, rightSlot }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {title}
            </h1>
            <MenuBar isAdmin={isAdmin} />
          </div>
          {rightSlot ? <div className="flex items-center gap-4">{rightSlot}</div> : null}
        </div>
      </div>
    </header>
  )
}
