"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { Flame, Film, Tv, LayoutDashboard, Users, FileText, Settings, FolderOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MenuItem {
  icon: React.ReactNode
  label: string
  value: string
  href: string
  gradient: string
  iconColor: string
}

const menuItems: MenuItem[] = [
  {
    icon: <Flame className="h-5 w-5" />,
    label: "Home",
    value: "home",
    href: "/",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
  {
    icon: <Film className="h-5 w-5" />,
    label: "Movies",
    value: "movies",
    href: "/movies",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <Tv className="h-5 w-5" />,
    label: "TV Shows",
    value: "tv",
    href: "/tv",
    gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
    iconColor: "text-purple-500",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Request",
    value: "request",
    href: "/request",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
]

const adminItems: MenuItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    value: "dashboard",
    href: "/admin/dashboard",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Requests",
    value: "requests",
    href: "/admin/requests",
    gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
    iconColor: "text-purple-500",
  },
  {
    icon: <FolderOpen className="h-5 w-5" />,
    label: "Library",
    value: "library",
    href: "/admin/library",
    gradient: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(2,132,199,0.06) 50%, rgba(3,105,161,0) 100%)",
    iconColor: "text-sky-500",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Users",
    value: "users",
    href: "/admin/users",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
    value: "settings",
    href: "/admin/settings",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
]

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

interface MenuBarProps {
  isAdmin?: boolean
}

export function MenuBar({ isAdmin = false }: MenuBarProps) {
  const pathname = usePathname()
  const items = isAdmin ? adminItems : menuItems

  return (
    <motion.nav className="p-2 rounded-2xl bg-gradient-to-b from-card/60 to-card/30 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden">
      <ul className="flex items-center gap-2 relative z-10">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.value === "home" && pathname === "/") ||
            (item.value === "movies" && pathname.startsWith("/movies")) ||
            (item.value === "tv" && pathname.startsWith("/tv"))
          return (
            <motion.li key={item.label} className="relative">
              <Link href={item.href}>
                <motion.div
                  className="block rounded-xl overflow-visible group relative cursor-pointer"
                  style={{ perspective: "600px" }}
                  whileHover="hover"
                  initial="initial"
                >
                  <motion.div
                    className="absolute inset-0 z-0 pointer-events-none"
                    variants={glowVariants}
                    animate={isActive ? "hover" : "initial"}
                    style={{
                      background: item.gradient,
                      opacity: isActive ? 1 : 0,
                      borderRadius: "16px",
                    }}
                  />
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 relative z-10 rounded-xl transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                    variants={itemVariants}
                    transition={sharedTransition}
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                  >
                    <span className={`transition-colors duration-300 ${isActive ? item.iconColor : ""}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </motion.div>
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 rounded-xl transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                    variants={backVariants}
                    transition={sharedTransition}
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                  >
                    <span className={`transition-colors duration-300 ${isActive ? item.iconColor : ""}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </motion.div>
                </motion.div>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </motion.nav>
  )
}
