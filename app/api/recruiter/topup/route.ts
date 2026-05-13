import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { requireSession } from "@/lib/service/auth"
import { addTestCredits } from "@/lib/service/recruiter"

/**
 * Temporary credit top-up endpoint while Stripe is not implemented.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession("recruiter")
    const body = await request.json()
    const amount = Number(body.amount || 0)
    if (![100, 500, 1000].includes(amount)) {
      return jsonError("Invalid top-up amount.", 400)
    }

    await addTestCredits(user.id, amount)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Top-up failed."
    return jsonError(message, message === "Unauthorized" ? 401 : 400)
  }
}
