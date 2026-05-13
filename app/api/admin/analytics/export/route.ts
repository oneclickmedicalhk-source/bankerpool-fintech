import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { exportAdminCsv } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get("type") || "analytics") as "users" | "jobs" | "referrals" | "analytics"
    const csv = await exportAdminCsv(type)
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-export.csv"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export analytics."
    return jsonError(message, statusFromError(error))
  }
}
