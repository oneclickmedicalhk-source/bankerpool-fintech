import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireAdmin } from "@/lib/service/auth"
import { logAdminAudit } from "@/lib/service/admin"

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const userIds = Array.isArray(body.userIds) ? body.userIds : []
    const subject = String(body.subject || "BankerPool Admin Notification")
    await logAdminAudit(admin, "users.bulk_email", "user", "bulk", {
      userIds,
      subject,
      bodyPreview: String(body.body || "").slice(0, 300),
    })
    return NextResponse.json({ ok: true, message: "Bulk email event logged for delivery queue." })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process bulk email."
    return jsonError(message, statusFromError(error))
  }
}
