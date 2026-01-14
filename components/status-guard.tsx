"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"

export function AccountStatusGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const verify = async () => {
      if (status !== "authenticated") {
        setChecked(true)
        return
      }
      const response = await fetch("/api/auth/status")
      if (response.ok) {
        const data = await response.json()
        if (data.isActive === false && pathname !== "/disabled") {
          router.replace("/disabled")
        }
      }
      setChecked(true)
    }
    verify()
  }, [status, pathname, router])

  if (!checked && status === "authenticated") {
    return null
  }

  return children
}
