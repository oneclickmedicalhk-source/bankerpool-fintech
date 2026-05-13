import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireAdmin } from "@/lib/service/auth"
import { updateAdminUser } from "@/lib/service/admin"

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const userIds = Array.isArray(body.userIds) ? body.userIds : []
    await Promise.all(
      userIds.map((id: string) => updateAdminUser(admin, String(id), { status: "suspended" })),
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to suspend users."
    return jsonError(message, statusFromError(error))
  }
}
