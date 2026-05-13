import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { createAdminJob, ensureAdminDefaults, listAdminJobs } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    await ensureAdminDefaults(admin)
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const status = searchParams.get("status") || "all"
    const data = await listAdminJobs({ query, status })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs."
    return jsonError(message, statusFromError(error))
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    await createAdminJob(admin, {
      title: String(body.title || "").trim(),
      company: String(body.company || "").trim(),
      department: String(body.department || "").trim(),
      location: String(body.location || "").trim(),
      salary: String(body.salary || "").trim(),
      status: (body.status || "pending") as "active" | "pending" | "expired" | "rejected",
      postedByName: String(body.postedByName || admin.name),
      featured: Boolean(body.featured),
      applications: Number(body.applications || 0),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create job."
    return jsonError(message, statusFromError(error))
  }
}
