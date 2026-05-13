import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { addTestCredits } from "@/lib/service/recruiter"

/**
 * Temporary credit top-up endpoint while Stripe is not implemented.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession("recruiter")
    if (process.env.NODE_ENV === "production") {
      return jsonError("Top-up test endpoint is disabled in production.", 403)
    }
    const body = await request.json()
    const amount = Number(body.amount || 0)
    if (![100, 500, 1000].includes(amount)) {
      return jsonError("Invalid top-up amount.", 400)
    }

    await addTestCredits(user.id, amount)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Top-up failed."
    return jsonError(message, statusFromError(error))
  }
}
