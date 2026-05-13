import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { ensureAdminDefaults, getAdminContentConfig, updateAdminContentConfig } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET() {
  try {
    const admin = await requireAdmin()
    await ensureAdminDefaults(admin)
    const content = await getAdminContentConfig()
    return NextResponse.json({ content })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load content."
    return jsonError(message, statusFromError(error))
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    await updateAdminContentConfig(admin, body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save content."
    return jsonError(message, statusFromError(error))
  }
}
