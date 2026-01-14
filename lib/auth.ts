import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

function getEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (
          adminEmail &&
          adminPassword &&
          credentials.email === adminEmail &&
          credentials.password === adminPassword
        ) {
          return {
            id: "admin",
            name: "Admin",
            email: credentials.email,
            role: "admin",
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name || "User",
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role
      if (typeof user?.isActive === "boolean") token.isActive = user.isActive
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
