import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireAdmin } from "@/lib/service/auth"
import { resetAdminUserPassword } from "@/lib/service/admin"

/**
 * Reset target user's password from admin panel.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin()
    const params = await context.params
    const body = await request.json()
    const password = String(body.password || "")
    await resetAdminUserPassword(admin, params.id, password)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password."
    return jsonError(message, statusFromError(error))
  }
}
