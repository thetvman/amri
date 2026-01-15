import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

const nextAuth = NextAuth(authConfig)

export const { handlers, auth } = nextAuth
export const { GET, POST } = handlers
