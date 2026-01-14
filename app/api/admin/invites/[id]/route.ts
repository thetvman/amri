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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.invite.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
