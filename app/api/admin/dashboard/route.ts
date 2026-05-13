import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { ensureAdminDefaults, getAdminDashboardData } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET() {
  try {
    const admin = await requireAdmin()
    await ensureAdminDefaults(admin)
    const data = await getAdminDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load admin dashboard."
    return jsonError(message, statusFromError(error))
  }
}
