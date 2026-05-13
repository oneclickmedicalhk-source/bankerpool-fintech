import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/service/auth"

/**
 * Return current authenticated user payload if a valid session exists.
 */
export async function GET() {
  const user = await getSessionUser()
  return NextResponse.json({ user })
}
