import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { updateAdminReferralStatus } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin()
    const params = await context.params
    const body = await request.json()
    await updateAdminReferralStatus(admin, params.id, body.status)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update referral."
    return jsonError(message, statusFromError(error))
  }
}
