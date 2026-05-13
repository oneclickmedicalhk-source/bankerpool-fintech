import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { getAdminAnalytics } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get("range") || "30d") as "7d" | "30d" | "90d" | "1y"
    const data = await getAdminAnalytics(range)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load analytics."
    return jsonError(message, statusFromError(error))
  }
}
