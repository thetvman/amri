require("dotenv").config({ path: ".env.local" })
require("dotenv").config()
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set")
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log("Admin already exists.")
    return
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10)
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  })

  console.log("Admin created.")
}

seedAdmin()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
