import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { loginUser, setSession } from "@/lib/service/auth"

/**
 * Authenticate existing user credentials and issue a session cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || "").trim()
    const password = String(body.password || "")

    if (!email || !password) {
      return jsonError("Email and password are required.", 400)
    }

    const user = await loginUser(email, password)
    await setSession(user)
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed."
    return jsonError(message, 401)
  }
}
