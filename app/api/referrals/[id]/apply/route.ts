import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { requireSession } from "@/lib/service/auth"
import { createReferralApplication } from "@/lib/service/community"

/**
 * Submit candidate application to a referral opportunity.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession("candidate")
    const params = await context.params
    const body = await request.json()

    await createReferralApplication(user, {
      referralId: params.id,
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      linkedin: String(body.linkedin || "").trim(),
      intro: String(body.intro || "").trim(),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply."
    return jsonError(message, message === "Unauthorized" ? 401 : 400)
  }
}
