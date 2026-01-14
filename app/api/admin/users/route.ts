import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/db"

async function requireAdmin(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== "admin") {
    return null
  }
  return token
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  return NextResponse.json(users)
}
