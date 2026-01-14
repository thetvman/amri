"use client"

import Link from "next/link"
import { Bookmark, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"

export function UserActions() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center gap-3">
      {!session?.user && (
        <Link href="/login" className="hidden md:inline-flex">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
      )}
      <Link href="/watchlist" className="hidden md:inline-flex">
        <Button variant="outline" size="sm">
          <Bookmark className="h-4 w-4 mr-2" />
          Watchlist
        </Button>
      </Link>
      <Link href="/profile" className="hidden md:inline-flex">
        <Button variant="secondary" size="sm">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
      </Link>
      {session?.user && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      )}
      <Link href="/profile" className="flex items-center">
        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary">
          {session?.user?.name?.slice(0, 2).toUpperCase() || "AM"}
        </div>
      </Link>
    </div>
  )
}
