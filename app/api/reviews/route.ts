import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { requireSession } from "@/lib/service/auth"
import { createCultureReview, listCultureReviews } from "@/lib/service/community"
import { ensureSeedData } from "@/lib/service/seed"

/**
 * Return all culture reviews for candidate and banker pages.
 */
export async function GET() {
  try {
    await ensureSeedData()
    const reviews = await listCultureReviews()
    return NextResponse.json({ reviews })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews."
    return jsonError(message, 400)
  }
}

/**
 * Create a new culture review from candidate or banker users.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession()
    if (user.role !== "candidate" && user.role !== "banker") {
      return jsonError("Only candidates and bankers can post reviews.", 403)
    }

    const body = await request.json()
    await createCultureReview(user, {
      bank: String(body.bank || "").trim(),
      department: String(body.department || "").trim(),
      rating: Number(body.rating || 0),
      title: String(body.title || "").trim(),
      content: String(body.content || "").trim(),
      pros: Array.isArray(body.pros)
        ? body.pros.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [],
      cons: Array.isArray(body.cons)
        ? body.cons.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [],
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review."
    return jsonError(message, message === "Unauthorized" ? 401 : 400)
  }
}
