import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { jsonError } from "@/lib/API/http"
import { statusFromError } from "@/lib/API/error"
import { requireSession } from "@/lib/service/auth"
import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import type { AppUser } from "@/lib/model/types"
import { getAppEnv } from "@/lib/utils/env"

/**
 * One-time bootstrap to promote allowlisted account to admin when no admin exists.
 */
export async function POST() {
  try {
    const sessionUser = await requireSession()
    const { adminAllowlistEmails } = getAppEnv()
    if (!adminAllowlistEmails.includes(sessionUser.email.toLowerCase())) {
      return jsonError("Forbidden", 403)
    }

    const db = await getDb()
    const users = db.collection<AppUser>(COLLECTIONS.users)
    const adminCount = await users.countDocuments({ role: "admin" })
    if (adminCount > 0) {
      return jsonError("Admin role already initialized.", 400)
    }

    await users.updateOne(
      { _id: new ObjectId(sessionUser.id) },
      { $set: { role: "admin" } },
    )

    return NextResponse.json({ ok: true, message: "Your account is now admin. Please log out and log in again." })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to bootstrap admin."
    return jsonError(message, statusFromError(error))
  }
}
