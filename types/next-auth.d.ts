import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    isActive?: boolean
  }

  interface Session {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      isActive?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    isActive?: boolean
  }
}
