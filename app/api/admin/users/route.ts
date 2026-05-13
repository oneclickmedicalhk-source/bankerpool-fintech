import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { createAdminUser, ensureAdminDefaults, listAdminUsers } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    await ensureAdminDefaults(admin)
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const role = searchParams.get("role") || "all"
    const status = searchParams.get("status") || "all"
    const data = await listAdminUsers({ query, role, status })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users."
    return jsonError(message, statusFromError(error))
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    await createAdminUser(admin, {
      firstName: String(body.firstName || "").trim(),
      lastName: String(body.lastName || "").trim(),
      email: String(body.email || "").trim(),
      role: body.role,
      initialCredits: Number(body.initialCredits || 0),
      password: String(body.password || "Password123!"),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user."
    return jsonError(message, statusFromError(error))
  }
}
