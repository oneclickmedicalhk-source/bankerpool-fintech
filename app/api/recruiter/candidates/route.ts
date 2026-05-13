import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { listCandidateCards, submitCandidateProfile } from "@/lib/service/recruiter"
import { ensureSeedData } from "@/lib/service/seed"

/**
 * List recruiter talent pool cards from MongoDB.
 */
export async function GET() {
  try {
    const user = await requireSession("recruiter")
    await ensureSeedData()
    const candidates = await listCandidateCards(user.id)
    return NextResponse.json({ candidates })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch candidates."
    return jsonError(message, statusFromError(error))
  }
}

/**
 * Persist recruiter candidate submissions from the submit tab form.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession("recruiter")
    const body = await request.json()

    await submitCandidateProfile(user, {
      title: String(body.title || "").trim(),
      yearsExp: Number(body.yearsExp || 0),
      currentSalary: String(body.currentSalary || "").trim(),
      expectedSalary: String(body.expectedSalary || "").trim(),
      skills: Array.isArray(body.skills)
        ? body.skills.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [],
      summary: String(body.summary || "").trim(),
      contactName: String(body.contactName || "").trim(),
      contactEmail: String(body.contactEmail || "").trim(),
      contactPhone: String(body.contactPhone || "").trim(),
      linkedin: String(body.linkedin || "").trim(),
      creditCost: Math.max(10, Number(body.creditCost || 50)),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit candidate."
    return jsonError(message, statusFromError(error))
  }
}
