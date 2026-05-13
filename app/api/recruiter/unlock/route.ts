import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { unlockCandidateContact } from "@/lib/service/recruiter"

/**
 * Unlock a candidate contact by debiting recruiter credits and recording ledger.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession("recruiter")
    const body = await request.json()
    const candidateId = String(body.candidateId || "").trim()
    if (!candidateId) {
      return jsonError("Candidate id is required.", 400)
    }

    const contact = await unlockCandidateContact(user, candidateId)
    return NextResponse.json({ contact })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unlock failed."
    return jsonError(message, statusFromError(error))
  }
}
