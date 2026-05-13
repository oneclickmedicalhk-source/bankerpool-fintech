import { NextResponse } from "next/server"
import { clearSession } from "@/lib/service/auth"

/**
 * Logout endpoint that clears the user session cookie.
 */
export async function POST() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
