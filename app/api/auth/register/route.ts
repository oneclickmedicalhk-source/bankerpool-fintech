import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { registerUser, setSession } from "@/lib/service/auth"

/**
 * Register a new user account and immediately establish a session cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || "").trim()
    const password = String(body.password || "")
    const role = String(body.role || "").trim()
    const name = String(body.name || "").trim()
    const bank = String(body.bank || "").trim()

    if (!email || !password || !role || !name) {
      return jsonError("Missing required fields.", 400)
    }

    if (!["recruiter", "candidate", "banker"].includes(role)) {
      return jsonError("Invalid role.", 400)
    }

    if (password.length < 8) {
      return jsonError("Password must be at least 8 characters.", 400)
    }

    const user = await registerUser({
      email,
      password,
      role: role as "recruiter" | "candidate" | "banker",
      name,
      bank,
    })

    await setSession(user)
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed."
    return jsonError(message, 400)
  }
}
