import type { ObjectId } from "mongodb"

export type UserRole = "recruiter" | "candidate" | "banker" | "admin"

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface AppUser {
  _id?: ObjectId
  email: string
  passwordHash: string
  role: UserRole
  name: string
  bank?: string
  credits: number
  createdAt: Date
}

export interface CandidateProfile {
  _id?: ObjectId
  recruiterId: string
  title: string
  yearsExp: number
  currentSalary: string
  expectedSalary: string
  skills: string[]
  summary: string
  contactName: string
  contactEmail: string
  contactPhone: string
  linkedin?: string
  creditCost: number
  createdAt: Date
}

export interface CandidateUnlockEvent {
  _id?: ObjectId
  candidateId: string
  unlockingRecruiterId: string
  ownerRecruiterId: string
  creditCost: number
  ownerReward: number
  createdAt: Date
}

export interface CreditLedgerEntry {
  _id?: ObjectId
  userId: string
  type: "earned" | "spent" | "purchased"
  description: string
  credits: number
  createdAt: Date
}

export interface CultureReview {
  _id?: ObjectId
  authorUserId: string
  authorRole: "candidate" | "banker"
  bank: string
  department: string
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  helpful: number
  createdAt: Date
}

export interface ReferralOpportunity {
  _id?: ObjectId
  bankerUserId: string
  postedByName: string
  bank: string
  title: string
  department: string
  level: string
  salary: string
  bonus: string
  description: string
  requirements: string[]
  status: "active" | "closed"
  createdAt: Date
}

export interface ReferralApplication {
  _id?: ObjectId
  referralId: string
  candidateUserId: string
  name: string
  email: string
  linkedin: string
  intro: string
  status: "new" | "reviewed" | "referred"
  createdAt: Date
}

export interface SalaryIntel {
  _id?: ObjectId
  role: string
  bank: string
  range: string
  bonus: string
  reports: number
  submittedByUserId?: string
  createdAt: Date
}

export interface AdminContentConfig {
  _id?: ObjectId
  hero: {
    badge: string
    headline: string
    subheadline: string
    showBadge: boolean
  }
  stats: Array<{ id: string; label: string; value: string }>
  cards: {
    recruiter: { title: string; description: string; buttonText: string; features: string[] }
    candidate: { title: string; description: string; buttonText: string; features: string[] }
    banker: { title: string; description: string; buttonText: string; features: string[] }
  }
  howItWorks: {
    title: string
    description: string
    steps: Array<{ step: number; title: string; description: string }>
  }
  footer: {
    tagline: string
    links: { terms: string; privacy: string; contact: string }
    showRegionBadge: boolean
  }
  theme: { primaryColor: string; backgroundStyle: "light" | "dark" | "system" }
  updatedAt: Date
  updatedBy: string
}

export interface AdminPlatformSettings {
  _id?: ObjectId
  general: {
    siteName: string
    siteUrl: string
    siteDescription: string
    defaultLanguage: string
    timezone: string
    maintenanceMode: boolean
    newUserRegistration: boolean
    emailVerificationRequired: boolean
    manualJobApproval: boolean
    creditsPerUnlock: number
    creditsEarnedPerUnlock: number
    newUserBonus: number
  }
  notifications: {
    newUserRegistration: boolean
    newJobPost: boolean
    newReferral: boolean
    profileUnlocks: boolean
    weeklyReports: boolean
    adminEmails: string[]
  }
  security: {
    requireAdminTwoFactor: boolean
    sessionTimeoutMinutes: number
    maxLoginAttempts: number
    enforcePasswordComplexity: boolean
  }
  api: {
    webhookUrl: string
    webhookEvents: Record<string, boolean>
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpUseTls: boolean
    fromName: string
    fromEmail: string
    emailFooter: string
  }
  updatedAt: Date
  updatedBy: string
}

export interface AdminApiKey {
  _id?: ObjectId
  environment: "production" | "test"
  label: string
  token: string
  createdAt: Date
  rotatedAt?: Date
  updatedBy: string
}

export interface AdminAuditLog {
  _id?: ObjectId
  adminUserId: string
  adminEmail: string
  action: string
  targetType: string
  targetId: string
  metadata: Record<string, unknown>
  createdAt: Date
}

export interface AdminWebhookEvent {
  _id?: ObjectId
  event: string
  payload: Record<string, unknown>
  delivered: boolean
  httpStatus?: number
  responseBody?: string
  error?: string
  createdAt: Date
}

export interface JobPost {
  _id?: ObjectId
  title: string
  company: string
  department: string
  location: string
  salary: string
  status: "active" | "pending" | "expired" | "rejected"
  postedByName: string
  featured: boolean
  applications: number
  createdAt: Date
}
