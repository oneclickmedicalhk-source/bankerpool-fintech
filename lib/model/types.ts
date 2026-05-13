import type { ObjectId } from "mongodb"

export type UserRole = "recruiter" | "candidate" | "banker"

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
