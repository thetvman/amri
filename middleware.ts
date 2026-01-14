import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const protectedRoutes = ["/profile", "/watchlist"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    if (token.isActive === false) {
      const url = request.nextUrl.clone()
      url.pathname = "/disabled"
      return NextResponse.redirect(url)
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    if (token.isActive === false) {
      const url = request.nextUrl.clone()
      url.pathname = "/disabled"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/profile", "/watchlist"],
}
