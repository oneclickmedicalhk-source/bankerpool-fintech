import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { createReferral, listAllReferrals } from "@/lib/service/community"
import { ensureSeedData } from "@/lib/service/seed"

/**
 * List all active referral opportunities for candidate/banker views.
 */
export async function GET() {
  try {
    await ensureSeedData()
    const referrals = await listAllReferrals()
    return NextResponse.json({ referrals })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch referrals."
    return jsonError(message, 400)
  }
}

/**
 * Create a referral posting for banker users.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession("banker")
    const body = await request.json()
    await createReferral(user, {
      title: String(body.title || "").trim(),
      bank: String(body.bank || "").trim(),
      department: String(body.department || "").trim(),
      level: String(body.level || "").trim(),
      salary: String(body.salary || "").trim(),
      bonus: String(body.bonus || "").trim(),
      description: String(body.description || "").trim(),
      requirements: Array.isArray(body.requirements)
        ? body.requirements.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [],
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create referral."
    return jsonError(message, statusFromError(error))
  }
}
