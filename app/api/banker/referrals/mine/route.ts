import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { listMyReferrals } from "@/lib/service/community"

/**
 * List referrals owned by the currently authenticated banker.
 */
export async function GET() {
  try {
    const user = await requireSession("banker")
    const referrals = await listMyReferrals(user.id)
    return NextResponse.json({ referrals })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch your referrals."
    return jsonError(message, statusFromError(error))
  }
}
