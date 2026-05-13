import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { listAdminReferrals } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const status = searchParams.get("status") || "all"
    const data = await listAdminReferrals({ query, status })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch referrals."
    return jsonError(message, statusFromError(error))
  }
}
