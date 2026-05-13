const DEFAULT_DB_NAME = "bankerpool"

/**
 * Read runtime environment values with safe local defaults.
 */
export function getAppEnv() {
  const mongodbUri = process.env.MONGODB_URI || ""
  const mongodbDbName = process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME
  const authSecret = process.env.AUTH_SECRET || "dev-only-change-me"
  const adminAllowlistEmails = (process.env.ADMIN_ALLOWLIST_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return {
    mongodbUri,
    mongodbDbName,
    authSecret,
    adminAllowlistEmails,
  }
}

/**
 * Ensure required production environment values exist before handling requests.
 */
export function assertServerEnv() {
  const { mongodbUri, authSecret } = getAppEnv()

  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI. Add it in your environment configuration.")
  }

  if (!authSecret) {
    throw new Error("Missing AUTH_SECRET. Add it in your environment configuration.")
  }
}
