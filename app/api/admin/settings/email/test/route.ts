import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireAdmin } from "@/lib/service/auth"
import { sendAdminTestEmail } from "@/lib/service/admin"

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const to = String(body.to || admin.email).trim()
    await sendAdminTestEmail(admin, to)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send test email."
    return jsonError(message, statusFromError(error))
  }
}
