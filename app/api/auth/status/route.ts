import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ isActive: false }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && token.email === adminEmail) {
    return NextResponse.json({ isActive: true, role: "admin" })
  }

  const userId = token.sub
  if (!userId) {
    return NextResponse.json({ isActive: false }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, role: true },
  })

  return NextResponse.json({
    isActive: user?.isActive ?? false,
    role: user?.role ?? "user",
  })
}
