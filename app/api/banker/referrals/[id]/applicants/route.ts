import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { listApplicantsForReferral } from "@/lib/service/community"

/**
 * List applicants for a banker-owned referral.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession("banker")
    const params = await context.params
    const applicants = await listApplicantsForReferral(user.id, params.id)
    return NextResponse.json({ applicants })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch applicants."
    return jsonError(message, statusFromError(error))
  }
}
