import { NextResponse } from "next/server"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { deleteAdminJob, updateAdminJob } from "@/lib/service/admin"
import { requireAdmin } from "@/lib/service/auth"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin()
    const params = await context.params
    const body = await request.json()
    await updateAdminJob(admin, params.id, body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update job."
    return jsonError(message, statusFromError(error))
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin()
    const params = await context.params
    await deleteAdminJob(admin, params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete job."
    return jsonError(message, statusFromError(error))
  }
}
