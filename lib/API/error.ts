/**
 * Convert thrown auth/business errors into consistent HTTP status codes.
 */
export function statusFromError(error: unknown) {
  const message = error instanceof Error ? error.message : ""
  if (message === "Unauthorized") {
    return 401
  }
  if (message === "Forbidden") {
    return 403
  }
  return 400
}
