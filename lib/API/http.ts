import { NextResponse } from "next/server"

/**
 * Create a consistent JSON error response payload and status code.
 */
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
