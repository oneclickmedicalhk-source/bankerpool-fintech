import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireAdmin } from "@/lib/service/auth"
import { rotateAdminApiKey } from "@/lib/service/admin"

export async function POST(
  _request: Request,
  context: { params: Promise<{ environment: string }> },
) {
  try {
    const admin = await requireAdmin()
    const params = await context.params
    const environment = params.environment === "production" ? "production" : "test"
    const token = await rotateAdminApiKey(admin, environment)
    return NextResponse.json({ ok: true, token })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rotate API key."
    return jsonError(message, statusFromError(error))
  }
}
