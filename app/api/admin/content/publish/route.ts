import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { logAdminAudit } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function POST() {
  try {
    const admin = await requireAdmin()
    await logAdminAudit(admin, "content.published", "content", "global", {})
    return NextResponse.json({ ok: true, message: "Content published." })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish content."
    return jsonError(message, statusFromError(error))
  }
}
