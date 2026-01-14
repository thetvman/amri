import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, inviteCode } = body

    if (!email || !password || !inviteCode) {
      return NextResponse.json({ error: "Invite code, email, and password are required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const invite = await prisma.invite.findUnique({ where: { code: inviteCode } })
    if (!invite || invite.usedById) {
      return NextResponse.json({ error: "Invalid or used invite code" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    })

    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        usedById: user.id,
        usedAt: new Date(),
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
  }
}
