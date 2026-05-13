import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { ensureAdminDefaults, getAdminSettings, updateAdminSettingsSection } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET() {
  try {
    const admin = await requireAdmin()
    await ensureAdminDefaults(admin)
    const settings = await getAdminSettings()
    return NextResponse.json(settings)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load settings."
    return jsonError(message, statusFromError(error))
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const section = body.section as "general" | "notifications" | "security" | "api" | "email"
    await updateAdminSettingsSection(admin, section, body.data || {})
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save settings."
    return jsonError(message, statusFromError(error))
  }
}
