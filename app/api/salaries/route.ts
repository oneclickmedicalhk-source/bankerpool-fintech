import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { requireSession } from "@/lib/service/auth"
import { createSalaryIntel, listSalaryIntel } from "@/lib/service/community"
import { ensureSeedData } from "@/lib/service/seed"

/**
 * Return salary benchmark entries for candidate and banker pages.
 */
export async function GET() {
  try {
    await ensureSeedData()
    const salaries = await listSalaryIntel()
    return NextResponse.json({ salaries })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch salaries."
    return jsonError(message, 400)
  }
}

/**
 * Allow banker users to contribute new salary benchmark entries.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSession("banker")
    const body = await request.json()
    await createSalaryIntel(user, {
      role: String(body.role || "").trim(),
      bank: String(body.bank || "").trim(),
      range: String(body.range || "").trim(),
      bonus: String(body.bonus || "").trim(),
      reports: Number(body.reports || 1),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit salary intel."
    return jsonError(message, message === "Unauthorized" ? 401 : 400)
  }
}
