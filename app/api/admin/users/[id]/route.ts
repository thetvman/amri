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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { role, isActive, name } = body
  const { id } = await params

  const user = await prisma.user.update({
    where: { id },
    data: {
      role: role ?? undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
      name: name ?? undefined,
    },
  })

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
