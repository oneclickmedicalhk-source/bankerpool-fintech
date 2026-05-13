import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { getAppEnv } from "@/lib/utils/env"

const rolePathMap: Record<string, "recruiter" | "candidate" | "banker" | "admin"> = {
  "/recruiter": "recruiter",
  "/candidate": "candidate",
  "/banker": "banker",
  "/admin": "admin",
}

function startsWithRolePath(pathname: string) {
  return Object.keys(rolePathMap).find((prefix) => pathname.startsWith(prefix))
}

/**
 * Enforce persona route access by checking session cookie and matching role claim.
 */
export async function middleware(request: NextRequest) {
  const rolePathPrefix = startsWithRolePath(request.nextUrl.pathname)
  if (!rolePathPrefix) {
    return NextResponse.next()
  }

  const token = request.cookies.get("bankerpool_session")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { authSecret } = getAppEnv()
    const { adminAllowlistEmails } = getAppEnv()
    const secret = new TextEncoder().encode(authSecret)
    const { payload } = await jwtVerify(token, secret)
    const role = String(payload.role || "")
    const email = String(payload.email || "").toLowerCase()
    const requiredRole = rolePathMap[rolePathPrefix]

    if (role !== requiredRole) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (requiredRole === "admin" && adminAllowlistEmails.length > 0 && !adminAllowlistEmails.includes(email)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  } catch (_error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/recruiter/:path*", "/candidate/:path*", "/banker/:path*", "/admin/:path*"],
}
