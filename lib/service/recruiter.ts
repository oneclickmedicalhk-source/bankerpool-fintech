import { ObjectId } from "mongodb"
import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import type {
  AppUser,
  CandidateProfile,
  CandidateUnlockEvent,
  CreditLedgerEntry,
  SessionUser,
} from "@/lib/model/types"

const OWNER_UNLOCK_REWARD = 50

function toObjectId(id: string) {
  return new ObjectId(id)
}

/**
 * Query candidates and project anonymous profile cards for recruiter dashboard.
 */
export async function listCandidateCards(currentUserId: string) {
  const db = await getDb()
  const profiles = db.collection<CandidateProfile>(COLLECTIONS.candidateProfiles)
  const unlocks = db.collection<CandidateUnlockEvent>(COLLECTIONS.candidateUnlockEvents)

  const rows = await profiles.find({}).sort({ createdAt: -1 }).toArray()

  return Promise.all(
    rows.map(async (profile) => {
      const postedDays = Math.max(
        1,
        Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      )
      const hasUnlocked =
        (await unlocks.countDocuments({
          candidateId: String((profile as CandidateProfile & { _id: ObjectId })._id),
          unlockingRecruiterId: currentUserId,
        })) > 0

      return {
        id: String((profile as CandidateProfile & { _id: ObjectId })._id),
        title: profile.title,
        yearsExp: profile.yearsExp,
        currentSalary: profile.currentSalary,
        expectedSalary: profile.expectedSalary,
        skills: profile.skills,
        summary: profile.summary,
        creditCost: profile.creditCost,
        postedDays,
        verified: true,
        unlocked: hasUnlocked,
      }
    }),
  )
}

/**
 * Persist a new candidate profile submission for the recruiter.
 */
export async function submitCandidateProfile(
  recruiter: SessionUser,
  payload: {
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
  },
) {
  const db = await getDb()
  const profiles = db.collection<CandidateProfile>(COLLECTIONS.candidateProfiles)

  await profiles.insertOne({
    recruiterId: recruiter.id,
    title: payload.title,
    yearsExp: payload.yearsExp,
    currentSalary: payload.currentSalary,
    expectedSalary: payload.expectedSalary,
    skills: payload.skills,
    summary: payload.summary,
    contactName: payload.contactName,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    linkedin: payload.linkedin || "",
    creditCost: payload.creditCost,
    createdAt: new Date(),
  })
}

/**
 * Return recruiter credit balance and a reverse-chronological ledger.
 */
export async function getRecruiterWallet(userId: string) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const ledger = db.collection<CreditLedgerEntry>(COLLECTIONS.creditLedger)

  const user = await users.findOne({ _id: toObjectId(userId) })
  if (!user) {
    throw new Error("User not found.")
  }

  const transactions = await ledger.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray()
  return {
    balance: user.credits,
    transactions: transactions.map((item) => ({
      id: String((item as CreditLedgerEntry & { _id: ObjectId })._id),
      type: item.type,
      description: item.description,
      credits: item.credits,
      date: new Date(item.createdAt).toISOString().slice(0, 10),
    })),
  }
}

/**
 * Execute candidate unlock, transferring credits and recording all ledger effects.
 */
export async function unlockCandidateContact(unlockingUser: SessionUser, candidateId: string) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const profiles = db.collection<CandidateProfile>(COLLECTIONS.candidateProfiles)
  const unlocks = db.collection<CandidateUnlockEvent>(COLLECTIONS.candidateUnlockEvents)
  const ledger = db.collection<CreditLedgerEntry>(COLLECTIONS.creditLedger)

  const profile = await profiles.findOne({ _id: toObjectId(candidateId) })
  if (!profile) {
    throw new Error("Candidate profile not found.")
  }

  const alreadyUnlocked = await unlocks.findOne({
    candidateId,
    unlockingRecruiterId: unlockingUser.id,
  })
  if (alreadyUnlocked) {
    return {
      contactName: profile.contactName,
      contactEmail: profile.contactEmail,
      contactPhone: profile.contactPhone,
      linkedin: profile.linkedin || "",
    }
  }

  const unlockingRecruiter = await users.findOne({ _id: toObjectId(unlockingUser.id) })
  if (!unlockingRecruiter) {
    throw new Error("Recruiter account not found.")
  }

  if (unlockingRecruiter.credits < profile.creditCost) {
    throw new Error("Insufficient credits.")
  }

  await users.updateOne({ _id: toObjectId(unlockingUser.id) }, { $inc: { credits: -profile.creditCost } })
  await ledger.insertOne({
    userId: unlockingUser.id,
    type: "spent",
    description: `Unlocked candidate: ${profile.title}`,
    credits: -profile.creditCost,
    createdAt: new Date(),
  })

  if (profile.recruiterId !== unlockingUser.id) {
    await users.updateOne({ _id: toObjectId(profile.recruiterId) }, { $inc: { credits: OWNER_UNLOCK_REWARD } })
    await ledger.insertOne({
      userId: profile.recruiterId,
      type: "earned",
      description: `Your candidate was unlocked: ${profile.title}`,
      credits: OWNER_UNLOCK_REWARD,
      createdAt: new Date(),
    })
  }

  await unlocks.insertOne({
    candidateId,
    unlockingRecruiterId: unlockingUser.id,
    ownerRecruiterId: profile.recruiterId,
    creditCost: profile.creditCost,
    ownerReward: profile.recruiterId === unlockingUser.id ? 0 : OWNER_UNLOCK_REWARD,
    createdAt: new Date(),
  })

  return {
    contactName: profile.contactName,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    linkedin: profile.linkedin || "",
  }
}

/**
 * Temporary non-Stripe top-up endpoint for MVP testing flows.
 */
export async function addTestCredits(userId: string, amount: number) {
  const db = await getDb()
  const users = db.collection<AppUser>(COLLECTIONS.users)
  const ledger = db.collection<CreditLedgerEntry>(COLLECTIONS.creditLedger)

  await users.updateOne({ _id: toObjectId(userId) }, { $inc: { credits: amount } })
  await ledger.insertOne({
    userId,
    type: "purchased",
    description: "Test credit top-up (Stripe pending)",
    credits: amount,
    createdAt: new Date(),
  })
}
