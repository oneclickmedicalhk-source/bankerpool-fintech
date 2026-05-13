import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { dispatchWebhook } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const event = String(body.event || "admin.test")
    await dispatchWebhook(event, {
      source: "admin.settings.test",
      triggeredBy: admin.email,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send test webhook."
    return jsonError(message, statusFromError(error))
  }
}
