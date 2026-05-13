import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { requireSession } from "@/lib/service/auth"
import { getRecruiterWallet } from "@/lib/service/recruiter"

/**
 * Read recruiter credit balance and transaction history.
 */
export async function GET() {
  try {
    const user = await requireSession("recruiter")
    const wallet = await getRecruiterWallet(user.id)
    return NextResponse.json(wallet)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch wallet."
    return jsonError(message, message === "Unauthorized" ? 401 : 400)
  }
}
