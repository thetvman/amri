import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/db"
import crypto from "crypto"

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

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usedBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  return NextResponse.json(invites)
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const code = crypto.randomBytes(4).toString("hex").toUpperCase()

  const invite = await prisma.invite.create({
    data: {
      code,
      createdBy: String(admin.sub || admin.email || "admin"),
    },
  })

  return NextResponse.json(invite)
}
