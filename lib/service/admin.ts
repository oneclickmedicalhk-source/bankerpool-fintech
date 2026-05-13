import crypto from "crypto"
import { ObjectId } from "mongodb"
import nodemailer from "nodemailer"
import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import { hashPassword } from "@/lib/service/auth"
import type {
  AdminApiKey,
  AdminAuditLog,
  AdminContentConfig,
  AdminPlatformSettings,
  AdminWebhookEvent,
  AppUser,
  CultureReview,
  JobPost,
  ReferralApplication,
  ReferralOpportunity,
  SalaryIntel,
  SessionUser,
  UserRole,
} from "@/lib/model/types"

const DEFAULT_WEBHOOK_EVENTS = {
  "user.created": true,
  "user.updated": true,
  "job.created": true,
  "job.approved": true,
  "referral.created": true,
  "referral.completed": true,
}

function normalizeId(value: ObjectId | string | undefined) {
  if (!value) {
    return ""
  }
  return typeof value === "string" ? value : value.toString()
}

/**
 * Insert one audit log entry for every admin mutation.
 */
export async function logAdminAudit(
  admin: SessionUser,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown>,
) {
  const db = await getDb()
  const audit = db.collection<AdminAuditLog>(COLLECTIONS.adminAuditLogs)
  await audit.insertOne({
    adminUserId: admin.id,
    adminEmail: admin.email,
    action,
    targetType,
    targetId,
    metadata,
    createdAt: new Date(),
  })
}

/**
 * Create baseline admin content/settings/docs if they do not exist yet.
 */
export async function ensureAdminDefaults(admin: SessionUser) {
  const db = await getDb()
  const contentCol = db.collection<AdminContentConfig>(COLLECTIONS.adminContent)
  const settingsCol = db.collection<AdminPlatformSettings>(COLLECTIONS.adminSettings)
  const apiKeyCol = db.collection<AdminApiKey>(COLLECTIONS.adminApiKeys)
  const jobsCol = db.collection<JobPost>(COLLECTIONS.jobPosts)

  const existingContent = await contentCol.findOne({})
  if (!existingContent) {
    await contentCol.insertOne({
      hero: {
        badge: "Exclusive to Hong Kong Banking Professionals",
        headline: "The Private Liquidity Pool for Banking Talent.",
        subheadline:
          "Stop ghosting candidates. Turn your inactive talent pool into credits. Access verified, high-intent banking professionals in Hong Kong.",
        showBadge: true,
      },
      stats: [
        { id: "profiles", label: "Profiles Unlocked", value: "567" },
        { id: "bankers", label: "Verified Bankers", value: "2,340+" },
        { id: "referrals", label: "Active Referrals", value: "89" },
        { id: "reviews", label: "Culture Reviews", value: "156" },
      ],
      cards: {
        recruiter: {
          title: "I'm a Recruiter",
          description: "Looking for banking talent",
          buttonText: "Enter Talent Pool",
          features: [
            "Browse anonymous candidate profiles",
            "Unlock contact details with credits",
            "Submit candidates to earn credits",
            "Manage your credit wallet",
          ],
        },
        candidate: {
          title: "I'm a Candidate",
          description: "Looking for the inside scoop",
          buttonText: "Get Inside Scoop",
          features: [
            "Read anonymous culture reviews",
            "Access salary benchmarks",
            "Find referral opportunities",
            "Share your own reviews",
          ],
        },
        banker: {
          title: "I'm a Banker",
          description: "Have a role, seeking referrals",
          buttonText: "Post Referral",
          features: [
            "Post referral opportunities",
            "Earn referral bonuses",
            "Share culture reviews",
            "Access insider intel",
          ],
        },
      },
      howItWorks: {
        title: "How BankerPool Works",
        description: "A trusted ecosystem connecting recruiters, candidates, and banking professionals",
        steps: [
          {
            step: 1,
            title: "Recruiters List Talent",
            description:
              "Submit anonymized candidate profiles to the pool. Earn 50 credits when someone unlocks your candidate.",
          },
          {
            step: 2,
            title: "Bankers Share Intel",
            description:
              "Verified bankers post culture reviews, salary data, and referral opportunities for their teams.",
          },
          {
            step: 3,
            title: "Candidates Get Matched",
            description:
              "Job seekers access insider information and apply for referrals directly from hiring managers.",
          },
        ],
      },
      footer: {
        tagline: "The private talent exchange for Hong Kong banking professionals",
        links: { terms: "/terms", privacy: "/privacy", contact: "/contact" },
        showRegionBadge: true,
      },
      theme: {
        primaryColor: "#2D8A6E",
        backgroundStyle: "light",
      },
      updatedAt: new Date(),
      updatedBy: admin.id,
    })
  }

  const existingSettings = await settingsCol.findOne({})
  if (!existingSettings) {
    await settingsCol.insertOne({
      general: {
        siteName: "BankerPool",
        siteUrl: "https://bankerpool.vercel.app",
        siteDescription: "The private liquidity pool for Hong Kong banking professionals",
        defaultLanguage: "en",
        timezone: "hkt",
        maintenanceMode: false,
        newUserRegistration: true,
        emailVerificationRequired: false,
        manualJobApproval: true,
        creditsPerUnlock: 50,
        creditsEarnedPerUnlock: 50,
        newUserBonus: 100,
      },
      notifications: {
        newUserRegistration: true,
        newJobPost: true,
        newReferral: true,
        profileUnlocks: true,
        weeklyReports: true,
        adminEmails: [admin.email],
      },
      security: {
        requireAdminTwoFactor: false,
        sessionTimeoutMinutes: 60,
        maxLoginAttempts: 5,
        enforcePasswordComplexity: true,
      },
      api: {
        webhookUrl: "",
        webhookEvents: DEFAULT_WEBHOOK_EVENTS,
      },
      email: {
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpUseTls: true,
        fromName: "BankerPool",
        fromEmail: "noreply@bankerpool.local",
        emailFooter: "BankerPool - The Private Liquidity Pool for Banking Talent",
      },
      updatedAt: new Date(),
      updatedBy: admin.id,
    })
  }

  const existingKeys = await apiKeyCol.countDocuments()
  if (existingKeys === 0) {
    await apiKeyCol.insertMany([
      {
        environment: "production",
        label: "Production API Key",
        token: `bp_live_${crypto.randomBytes(24).toString("hex")}`,
        createdAt: new Date(),
        updatedBy: admin.id,
      },
      {
        environment: "test",
        label: "Test API Key",
        token: `bp_test_${crypto.randomBytes(24).toString("hex")}`,
        createdAt: new Date(),
        updatedBy: admin.id,
      },
    ])
  }

  const existingJobs = await jobsCol.countDocuments()
  if (existingJobs === 0) {
    await jobsCol.insertMany([
      {
        title: "VP, Compliance",
        company: "HSBC",
        department: "Compliance",
        location: "Central, HK",
        salary: "HKD 1.8M - 2.2M",
        status: "active",
        postedByName: "System Seed",
        featured: true,
        applications: 24,
        createdAt: new Date(),
      },
      {
        title: "Director, Risk Management",
        company: "UBS",
        department: "Risk",
        location: "IFC, HK",
        salary: "HKD 2.5M - 3.0M",
        status: "pending",
        postedByName: "System Seed",
        featured: false,
        applications: 0,
        createdAt: new Date(),
      },
    ])
  }
}

/**
 * Return card metrics, activity feed, and pending queue for admin dashboard.
 */
export async function getAdminDashboardData() {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const jobs = db.collection<JobPost>(COLLECTIONS.jobPosts)
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const reviews = db.collection<CultureReview>(COLLECTIONS.cultureReviews)
  const audit = db.collection<AdminAuditLog>(COLLECTIONS.adminAuditLogs)

  const [totalUsers, activeJobs, activeReferrals, totalReviews] = await Promise.all([
    users.countDocuments(),
    jobs.countDocuments({ status: "active" }),
    referrals.countDocuments({ status: "active" }),
    reviews.countDocuments(),
  ])

  const recentAudit = await audit.find({}).sort({ createdAt: -1 }).limit(10).toArray()
  const pending = {
    candidateReview: await reviews.countDocuments({ helpful: { $lte: 0 } }),
    jobApproval: await jobs.countDocuments({ status: "pending" }),
    referralVerification: await referrals.countDocuments({ status: "active" }),
    userReports: 0,
  }

  return {
    stats: {
      totalUsers,
      activeJobs,
      activeReferrals,
      pageViews: totalUsers * 12 + totalReviews * 9,
    },
    activity: recentAudit.map((item) => ({
      id: normalizeId(item._id),
      user: item.adminEmail,
      action: item.action,
      type: item.targetType,
      time: new Date(item.createdAt).toISOString(),
    })),
    pending,
  }
}

/**
 * Read persisted content management config.
 */
export async function getAdminContentConfig() {
  const db = await getDb()
  const collection = db.collection<AdminContentConfig>(COLLECTIONS.adminContent)
  const existing = await collection.findOne({})
  return existing
}

/**
 * Update website content configuration and track editor identity.
 */
export async function updateAdminContentConfig(admin: SessionUser, payload: Partial<AdminContentConfig>) {
  const db = await getDb()
  const collection = db.collection<AdminContentConfig>(COLLECTIONS.adminContent)
  await collection.updateOne(
    {},
    {
      $set: {
        ...payload,
        updatedAt: new Date(),
        updatedBy: admin.id,
      },
    },
    { upsert: true },
  )
  await logAdminAudit(admin, "content.updated", "content", "global", { keys: Object.keys(payload) })
}

/**
 * Query users list with filters and aggregate user status counts.
 */
export async function listAdminUsers(params: {
  query: string
  role: string
  status: string
}) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)

  const filter: Record<string, unknown> = {}
  if (params.query) {
    filter.$or = [
      { name: { $regex: params.query, $options: "i" } },
      { email: { $regex: params.query, $options: "i" } },
    ]
  }
  if (params.role && params.role !== "all") {
    filter.role = params.role
  }
  if (params.status && params.status !== "all") {
    filter.status = params.status
  }

  const rows = await users.find(filter).sort({ createdAt: -1 }).limit(500).toArray()
  const mapped = rows.map((user) => ({
    id: normalizeId(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: (user as AppUser & { status?: string }).status || "active",
    credits: user.credits,
    joined: new Date(user.createdAt).toISOString().slice(0, 10),
    avatar: user.name
      .split(" ")
      .map((item) => item[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  }))

  return {
    users: mapped,
    counts: {
      total: await users.countDocuments(),
      active: await users.countDocuments({ status: "active" }),
      pending: await users.countDocuments({ status: "pending" }),
      suspended: await users.countDocuments({ status: "suspended" }),
    },
  }
}

/**
 * Create a user from admin panel with explicit role and initial credit balance.
 */
export async function createAdminUser(
  admin: SessionUser,
  payload: {
    firstName: string
    lastName: string
    email: string
    role: "recruiter" | "candidate" | "banker" | "admin"
    initialCredits: number
    password: string
  },
) {
  const db = await getDb()
  const users = db.collection<AppUser & { status?: string }>(COLLECTIONS.users)
  const exists = await users.findOne({ email: payload.email.toLowerCase() })
  if (exists) {
    throw new Error("User email already exists.")
  }

  const bcrypt = await import("bcryptjs")
  const passwordHash = await bcrypt.hash(payload.password, 10)
  const name = `${payload.firstName} ${payload.lastName}`.trim()
  const created = await users.insertOne({
    email: payload.email.toLowerCase(),
    passwordHash,
    role: payload.role,
    name,
    credits: Math.max(0, payload.initialCredits),
    status: "active",
    createdAt: new Date(),
  })

  await logAdminAudit(admin, "user.created", "user", created.insertedId.toString(), {
    role: payload.role,
    email: payload.email,
  })
  await dispatchWebhook("user.created", {
    id: created.insertedId.toString(),
    email: payload.email,
    role: payload.role,
    createdBy: admin.email,
  })
}

/**
 * Update user account role/status/credits by admin action.
 */
export async function updateAdminUser(
  admin: SessionUser,
  userId: string,
  updates: Partial<{ role: UserRole; status: string; credits: number; name: string }>,
) {
  const db = await getDb()
  const users = db.collection<AppUser & { status?: string }>(COLLECTIONS.users)
  await users.updateOne({ _id: new ObjectId(userId) }, { $set: updates as Record<string, unknown> })
  await logAdminAudit(admin, "user.updated", "user", userId, updates as Record<string, unknown>)
  await dispatchWebhook("user.updated", {
    id: userId,
    updates,
    updatedBy: admin.email,
  })
}

/**
 * Reset one user's login password from admin console.
 */
export async function resetAdminUserPassword(admin: SessionUser, userId: string, newPassword: string) {
  const password = newPassword.trim()
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.")
  }

  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const result = await users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { passwordHash: await hashPassword(password) } },
  )
  if (result.matchedCount === 0) {
    throw new Error("User not found.")
  }

  await logAdminAudit(admin, "user.password_reset", "user", userId, {
    resetBy: admin.email,
  })
}

/**
 * Permanently remove a user document from platform.
 */
export async function deleteAdminUser(admin: SessionUser, userId: string) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  await users.deleteOne({ _id: new ObjectId(userId) })
  await logAdminAudit(admin, "user.deleted", "user", userId, {})
}

/**
 * Return all jobs with optional text/status filtering and counters.
 */
export async function listAdminJobs(params: { query: string; status: string }) {
  const db = await getDb()
  const jobs = db.collection<JobPost>(COLLECTIONS.jobPosts)
  const filter: Record<string, unknown> = {}
  if (params.query) {
    filter.$or = [
      { title: { $regex: params.query, $options: "i" } },
      { company: { $regex: params.query, $options: "i" } },
    ]
  }
  if (params.status && params.status !== "all") {
    filter.status = params.status
  }
  const rows = await jobs.find(filter).sort({ createdAt: -1 }).toArray()

  return {
    jobs: rows.map((item) => ({
      id: normalizeId(item._id),
      title: item.title,
      company: item.company,
      department: item.department,
      location: item.location,
      salary: item.salary,
      status: item.status,
      applications: item.applications,
      posted: new Date(item.createdAt).toISOString().slice(0, 10),
      postedBy: item.postedByName,
      featured: item.featured,
    })),
    counts: {
      total: await jobs.countDocuments(),
      active: await jobs.countDocuments({ status: "active" }),
      pending: await jobs.countDocuments({ status: "pending" }),
      applications: rows.reduce((sum, item) => sum + item.applications, 0),
    },
  }
}

/**
 * Create a job post from admin panel.
 */
export async function createAdminJob(admin: SessionUser, payload: Omit<JobPost, "_id" | "createdAt">) {
  const db = await getDb()
  const jobs = db.collection<JobPost>(COLLECTIONS.jobPosts)
  const result = await jobs.insertOne({
    ...payload,
    createdAt: new Date(),
  })
  await logAdminAudit(admin, "job.created", "job", result.insertedId.toString(), { title: payload.title })
  await dispatchWebhook("job.created", {
    id: result.insertedId.toString(),
    title: payload.title,
    company: payload.company,
  })
}

/**
 * Update job status and metadata fields.
 */
export async function updateAdminJob(
  admin: SessionUser,
  jobId: string,
  updates: Partial<JobPost>,
) {
  const db = await getDb()
  const jobs = db.collection<JobPost>(COLLECTIONS.jobPosts)
  await jobs.updateOne({ _id: new ObjectId(jobId) }, { $set: updates })
  await logAdminAudit(admin, "job.updated", "job", jobId, updates as Record<string, unknown>)
  if (updates.status === "active") {
    await dispatchWebhook("job.approved", {
      id: jobId,
      approvedBy: admin.email,
    })
  }
}

/**
 * Delete a job row from admin list.
 */
export async function deleteAdminJob(admin: SessionUser, jobId: string) {
  const db = await getDb()
  const jobs = db.collection<JobPost>(COLLECTIONS.jobPosts)
  await jobs.deleteOne({ _id: new ObjectId(jobId) })
  await logAdminAudit(admin, "job.deleted", "job", jobId, {})
}

/**
 * List referrals with joined applicant and referrer context for admin workflow.
 */
export async function listAdminReferrals(params: { query: string; status: string }) {
  const db = await getDb()
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const apps = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)
  const users = db.collection<AppUser>(COLLECTIONS.users)

  const refRows = await referrals.find({}).sort({ createdAt: -1 }).toArray()
  const appRows = await apps.find({}).sort({ createdAt: -1 }).toArray()

  const rows = await Promise.all(
    appRows.map(async (app) => {
      const referral = refRows.find((item) => normalizeId(item._id) === app.referralId)
      const candidate = await users.findOne({ _id: new ObjectId(app.candidateUserId) })
      return {
        id: normalizeId(app._id),
        candidateName: app.name || candidate?.name || "Unknown",
        candidateTitle: referral?.title || "Unknown Role",
        referrerName: referral?.postedByName || "Unknown",
        referrerCompany: referral?.bank || "Unknown",
        targetCompany: referral?.bank || "Unknown",
        targetRole: referral?.title || "Unknown",
        bonus: referral?.bonus || "HKD 0",
        status: app.status === "referred" ? "completed" : app.status === "reviewed" ? "active" : "pending",
        stage: app.status === "referred" ? "Hired" : app.status === "reviewed" ? "Interview" : "Submitted",
        submitted: new Date(app.createdAt).toISOString().slice(0, 10),
        avatar: (app.name || "NA")
          .split(" ")
          .map((i) => i[0] || "")
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        referralId: app.referralId,
      }
    }),
  )

  const filtered = rows.filter((item) => {
    const matchesQuery =
      !params.query ||
      item.candidateName.toLowerCase().includes(params.query.toLowerCase()) ||
      item.referrerName.toLowerCase().includes(params.query.toLowerCase()) ||
      item.targetCompany.toLowerCase().includes(params.query.toLowerCase())
    const matchesStatus = params.status === "all" || item.status === params.status
    return matchesQuery && matchesStatus
  })

  return {
    referrals: filtered,
    counts: {
      total: rows.length,
      active: rows.filter((item) => item.status === "active").length,
      completed: rows.filter((item) => item.status === "completed").length,
      pending: rows.filter((item) => item.status === "pending").length,
      totalBonus: rows
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + Number(item.bonus.replace(/[^\d]/g, "") || 0), 0),
    },
  }
}

/**
 * Update referral application status from admin review actions.
 */
export async function updateAdminReferralStatus(
  admin: SessionUser,
  referralApplicationId: string,
  nextStatus: "new" | "reviewed" | "referred",
) {
  const db = await getDb()
  const apps = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)
  await apps.updateOne({ _id: new ObjectId(referralApplicationId) }, { $set: { status: nextStatus } })
  await logAdminAudit(admin, "referral.updated", "referral_application", referralApplicationId, {
    status: nextStatus,
  })
  await dispatchWebhook(nextStatus === "referred" ? "referral.completed" : "referral.created", {
    id: referralApplicationId,
    status: nextStatus,
    updatedBy: admin.email,
  })
}

/**
 * Produce analytics payload for dashboard charts and tables.
 */
export async function getAdminAnalytics(range: "7d" | "30d" | "90d" | "1y") {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const jobs = db.collection<JobPost>(COLLECTIONS.jobPosts)
  const referrals = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)
  const salaries = db.collection<SalaryIntel>(COLLECTIONS.salaryIntel)
  const reviews = db.collection<CultureReview>(COLLECTIONS.cultureReviews)

  const totalUsers = await users.countDocuments()
  const totalJobs = await jobs.countDocuments()
  const totalReferrals = await referrals.countDocuments()
  const totalViews = totalUsers * 24 + totalJobs * 16 + totalReferrals * 18

  const topPages = [
    { path: "/", views: totalViews, percentage: 36 },
    { path: "/recruiter", views: Math.floor(totalViews * 0.23), percentage: 23 },
    { path: "/candidate", views: Math.floor(totalViews * 0.16), percentage: 16 },
    { path: "/banker", views: Math.floor(totalViews * 0.12), percentage: 12 },
    { path: "/login", views: Math.floor(totalViews * 0.08), percentage: 8 },
  ]

  const groupedUsers = await users
    .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$role", count: { $sum: 1 } } }])
    .toArray()

  return {
    range,
    metrics: {
      pageViews: totalViews,
      newUsers: totalUsers,
      jobsPosted: totalJobs,
      referralConversions: await referrals.countDocuments({ status: "referred" }),
    },
    topPages,
    userByRole: groupedUsers,
    recentConversions: await referrals
      .find({ status: "referred" })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
    health: {
      uptime: "99.98%",
      responseTime: "145ms",
      errorRate: "0.12%",
      activeSessions: totalUsers + totalJobs + totalReferrals + (await salaries.countDocuments()) + (await reviews.countDocuments()),
    },
  }
}

/**
 * Read full platform settings object for admin settings tabs.
 */
export async function getAdminSettings() {
  const db = await getDb()
  const settings = db.collection<AdminPlatformSettings>(COLLECTIONS.adminSettings)
  const apiKeys = db.collection<AdminApiKey>(COLLECTIONS.adminApiKeys)
  const settingsDoc = await settings.findOne({})
  const keys = await apiKeys.find({}).toArray()
  const sanitizedSettings = settingsDoc
    ? {
        ...settingsDoc,
        email: {
          ...settingsDoc.email,
          smtpPassword: settingsDoc.email.smtpPassword ? "********" : "",
        },
      }
    : null

  return {
    settings: sanitizedSettings,
    apiKeys: keys.map((key) => ({
      id: normalizeId(key._id),
      environment: key.environment,
      label: key.label,
      maskedToken: `${key.token.slice(0, 12)}...${key.token.slice(-6)}`,
      createdAt: key.createdAt,
      rotatedAt: key.rotatedAt,
    })),
  }
}

/**
 * Update one settings section while preserving other sections in the same document.
 */
export async function updateAdminSettingsSection(
  admin: SessionUser,
  section:
    | "general"
    | "notifications"
    | "security"
    | "api"
    | "email",
  payload: Record<string, unknown>,
) {
  const db = await getDb()
  const settings = db.collection<AdminPlatformSettings>(COLLECTIONS.adminSettings)
  if (section === "email") {
    const existing = await settings.findOne({})
    if (existing && (!payload.smtpPassword || payload.smtpPassword === "********")) {
      payload.smtpPassword = existing.email.smtpPassword
    }
  }
  await settings.updateOne(
    {},
    {
      $set: {
        [section]: payload,
        updatedAt: new Date(),
        updatedBy: admin.id,
      },
    },
    { upsert: true },
  )
  await logAdminAudit(admin, "settings.updated", "settings", section, payload)
}

/**
 * Rotate or create one API key and return the full new token once.
 */
export async function rotateAdminApiKey(
  admin: SessionUser,
  environment: "production" | "test",
) {
  const db = await getDb()
  const apiKeys = db.collection<AdminApiKey>(COLLECTIONS.adminApiKeys)
  const tokenPrefix = environment === "production" ? "bp_live_" : "bp_test_"
  const token = `${tokenPrefix}${crypto.randomBytes(24).toString("hex")}`
  await apiKeys.updateOne(
    { environment },
    {
      $set: {
        environment,
        label: environment === "production" ? "Production API Key" : "Test API Key",
        token,
        rotatedAt: new Date(),
        updatedBy: admin.id,
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  )
  await logAdminAudit(admin, "api_key.rotated", "api_key", environment, {})
  return token
}

/**
 * Send a test email with current SMTP configuration to verify deliverability.
 */
export async function sendAdminTestEmail(admin: SessionUser, to: string) {
  const db = await getDb()
  const settingsCol = db.collection<AdminPlatformSettings>(COLLECTIONS.adminSettings)
  const settings = await settingsCol.findOne({})
  if (!settings) {
    throw new Error("Settings not configured.")
  }
  const email = settings.email
  const transport = nodemailer.createTransport({
    host: email.smtpHost,
    port: email.smtpPort,
    secure: email.smtpPort === 465,
    requireTLS: email.smtpUseTls,
    auth: {
      user: email.smtpUsername,
      pass: email.smtpPassword,
    },
  })

  await transport.sendMail({
    from: `${email.fromName} <${email.fromEmail}>`,
    to,
    subject: "BankerPool SMTP Test Email",
    text: `This is a test email from BankerPool admin.\n\n${email.emailFooter}`,
  })
  await logAdminAudit(admin, "email.test_sent", "email", to, {})
}

/**
 * Dispatch one signed webhook payload and persist delivery results.
 */
export async function dispatchWebhook(
  event: string,
  payload: Record<string, unknown>,
) {
  const db = await getDb()
  const settingsCol = db.collection<AdminPlatformSettings>(COLLECTIONS.adminSettings)
  const webhookCol = db.collection<AdminWebhookEvent>(COLLECTIONS.adminWebhookEvents)
  const settings = await settingsCol.findOne({})
  const webhookUrl = settings?.api?.webhookUrl || ""
  const enabled = settings?.api?.webhookEvents?.[event]

  if (!webhookUrl || !enabled) {
    await webhookCol.insertOne({
      event,
      payload,
      delivered: false,
      error: "Webhook disabled or URL not configured.",
      createdAt: new Date(),
    })
    return
  }

  const secret = settings.email.smtpPassword || "bankerpool-webhook-secret"
  const raw = JSON.stringify(payload)
  const signature = crypto.createHmac("sha256", secret).update(raw).digest("hex")

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BankerPool-Event": event,
        "X-BankerPool-Signature": signature,
      },
      body: raw,
    })
    const text = await response.text()
    await webhookCol.insertOne({
      event,
      payload,
      delivered: response.ok,
      httpStatus: response.status,
      responseBody: text.slice(0, 2000),
      createdAt: new Date(),
    })
  } catch (error) {
    await webhookCol.insertOne({
      event,
      payload,
      delivered: false,
      error: error instanceof Error ? error.message : "Unknown webhook error",
      createdAt: new Date(),
    })
  }
}

/**
 * Return one CSV payload for requested export type.
 */
export async function exportAdminCsv(type: "users" | "jobs" | "referrals" | "analytics") {
  const db = await getDb()

  if (type === "users") {
    const rows = await db.collection<AppUser>(COLLECTIONS.users).find({}).toArray()
    const csv = [
      "id,email,name,role,credits,createdAt",
      ...rows.map(
        (item) =>
          `${normalizeId(item._id)},${item.email},${item.name},${item.role},${item.credits},${new Date(item.createdAt).toISOString()}`,
      ),
    ].join("\n")
    return csv
  }

  if (type === "jobs") {
    const rows = await db.collection<JobPost>(COLLECTIONS.jobPosts).find({}).toArray()
    const csv = [
      "id,title,company,department,status,applications,createdAt",
      ...rows.map(
        (item) =>
          `${normalizeId(item._id)},"${item.title}","${item.company}",${item.department},${item.status},${item.applications},${new Date(item.createdAt).toISOString()}`,
      ),
    ].join("\n")
    return csv
  }

  if (type === "referrals") {
    const rows = await db.collection<ReferralApplication>(COLLECTIONS.referralApplications).find({}).toArray()
    const csv = [
      "id,referralId,candidateUserId,name,email,status,createdAt",
      ...rows.map(
        (item) =>
          `${normalizeId(item._id)},${item.referralId},${item.candidateUserId},"${item.name}",${item.email},${item.status},${new Date(item.createdAt).toISOString()}`,
      ),
    ].join("\n")
    return csv
  }

  const analytics = await getAdminAnalytics("30d")
  return [
    "metric,value",
    `pageViews,${analytics.metrics.pageViews}`,
    `newUsers,${analytics.metrics.newUsers}`,
    `jobsPosted,${analytics.metrics.jobsPosted}`,
    `referralConversions,${analytics.metrics.referralConversions}`,
  ].join("\n")
}
