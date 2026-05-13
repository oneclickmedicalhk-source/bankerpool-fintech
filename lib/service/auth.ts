import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import type { AppUser, SessionUser, UserRole } from "@/lib/model/types"
import { getAppEnv } from "@/lib/utils/env"

const SESSION_COOKIE = "bankerpool_session"

function sessionSecret() {
  const { authSecret } = getAppEnv()
  return new TextEncoder().encode(authSecret)
}

/**
 * Hash a plaintext password before persisting user credentials.
 */
export async function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, 10)
}

/**
 * Compare user login password against stored password hash.
 */
export async function verifyPassword(plainPassword: string, passwordHash: string) {
  return bcrypt.compare(plainPassword, passwordHash)
}

/**
 * Create and sign a lightweight JWT payload for browser session cookie.
 */
async function signSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecret())
}

/**
 * Write the auth cookie after login/register success.
 */
export async function setSession(user: SessionUser) {
  const token = await signSessionToken(user)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

/**
 * Clear the auth cookie on logout.
 */
export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Decode and verify the current request session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, sessionSecret())

    if (!payload.sub || !payload.email || !payload.role || !payload.name) {
      return null
    }

    return {
      id: String(payload.sub),
      email: String(payload.email),
      role: payload.role as UserRole,
      name: String(payload.name),
    }
  } catch (_err) {
    return null
  }
}

/**
 * Enforce that a user is logged in and optionally belongs to a required role.
 */
export async function requireSession(role?: UserRole) {
  const user = await getSessionUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  if (role && user.role !== role) {
    throw new Error("Forbidden")
  }
  return user
}

/**
 * Enforce admin-only access using both role and email allowlist.
 */
export async function requireAdmin() {
  const user = await requireSession()
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const { adminAllowlistEmails } = getAppEnv()

  const dbUser = await users.findOne({ _id: new ObjectId(user.id) })
  if (!dbUser || dbUser.role !== "admin") {
    throw new Error("Forbidden")
  }

  if (adminAllowlistEmails.length > 0 && !adminAllowlistEmails.includes(user.email.toLowerCase())) {
    throw new Error("Forbidden")
  }

  return {
    id: user.id,
    email: user.email,
    role: "admin" as const,
    name: user.name,
  }
}

/**
 * Register a new account and return its session-safe fields.
 */
export async function registerUser(params: {
  email: string
  password: string
  role: UserRole
  name: string
  bank?: string
}) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)

  const existing = await users.findOne({ email: params.email.toLowerCase() })
  if (existing) {
    throw new Error("An account with this email already exists.")
  }

  const userDoc: AppUser = {
    email: params.email.toLowerCase(),
    passwordHash: await hashPassword(params.password),
    role: params.role,
    name: params.name,
    bank: params.bank || "",
    credits: params.role === "recruiter" ? 300 : 0,
    createdAt: new Date(),
  }

  const result = await users.insertOne(userDoc)
  return {
    id: result.insertedId.toString(),
    email: userDoc.email,
    role: userDoc.role,
    name: userDoc.name,
  } satisfies SessionUser
}

/**
 * Authenticate with email/password and return a session-safe profile.
 */
export async function loginUser(email: string, password: string) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const user = await users.findOne({ email: email.toLowerCase() })

  if (!user) {
    throw new Error("Invalid email or password.")
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    throw new Error("Invalid email or password.")
  }

  return {
    id: String((user as AppUser & { _id: ObjectId })._id),
    email: user.email,
    role: user.role,
    name: user.name,
  } satisfies SessionUser
}
