import { ObjectId } from "mongodb"
import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import type {
  CultureReview,
  ReferralApplication,
  ReferralOpportunity,
  SalaryIntel,
  SessionUser,
} from "@/lib/model/types"

function toObjectId(id: string) {
  return new ObjectId(id)
}

/**
 * Read and shape culture reviews for both candidate and banker dashboards.
 */
export async function listCultureReviews() {
  const db = await getDb()
  const reviews = db.collection<CultureReview>(COLLECTIONS.cultureReviews)
  const rows = await reviews.find({}).sort({ createdAt: -1 }).limit(100).toArray()

  return rows.map((review) => {
    const postedDays = Math.max(
      1,
      Math.floor((Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    )
    return {
      id: String((review as CultureReview & { _id: ObjectId })._id),
      bank: review.bank,
      department: review.department,
      rating: review.rating,
      title: review.title,
      content: review.content,
      pros: review.pros,
      cons: review.cons,
      helpful: review.helpful,
      postedDays,
      verified: true,
    }
  })
}

/**
 * Persist an anonymous culture review from banker or candidate personas.
 */
export async function createCultureReview(
  user: SessionUser,
  payload: {
    bank: string
    department: string
    rating: number
    title: string
    content: string
    pros: string[]
    cons: string[]
  },
) {
  const db = await getDb()
  const reviews = db.collection<CultureReview>(COLLECTIONS.cultureReviews)

  await reviews.insertOne({
    authorUserId: user.id,
    authorRole: user.role as "candidate" | "banker",
    bank: payload.bank,
    department: payload.department,
    rating: payload.rating,
    title: payload.title,
    content: payload.content,
    pros: payload.pros,
    cons: payload.cons,
    helpful: 0,
    createdAt: new Date(),
  })
}

/**
 * List salary intel entries shown in both candidate and banker salary tabs.
 */
export async function listSalaryIntel() {
  const db = await getDb()
  const salaries = db.collection<SalaryIntel>(COLLECTIONS.salaryIntel)
  const rows = await salaries.find({}).sort({ createdAt: -1 }).limit(100).toArray()
  return rows.map((salary) => ({
    id: String((salary as SalaryIntel & { _id: ObjectId })._id),
    role: salary.role,
    bank: salary.bank,
    range: salary.range,
    bonus: salary.bonus,
    reports: salary.reports,
  }))
}

/**
 * Add a new salary intel record to keep salary table live and growing.
 */
export async function createSalaryIntel(
  user: SessionUser,
  payload: {
    role: string
    bank: string
    range: string
    bonus: string
    reports: number
  },
) {
  const db = await getDb()
  const salaries = db.collection<SalaryIntel>(COLLECTIONS.salaryIntel)
  await salaries.insertOne({
    role: payload.role,
    bank: payload.bank,
    range: payload.range,
    bonus: payload.bonus,
    reports: payload.reports,
    submittedByUserId: user.id,
    createdAt: new Date(),
  })
}

/**
 * Return active referrals with applicant counts for marketplace listing.
 */
export async function listAllReferrals() {
  const db = await getDb()
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const applications = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)
  const rows = await referrals.find({ status: "active" }).sort({ createdAt: -1 }).toArray()

  return Promise.all(
    rows.map(async (referral) => {
      const applicants = await applications.countDocuments({
        referralId: String((referral as ReferralOpportunity & { _id: ObjectId })._id),
      })
      const postedDays = Math.max(
        1,
        Math.floor((Date.now() - new Date(referral.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      )
      return {
        id: String((referral as ReferralOpportunity & { _id: ObjectId })._id),
        title: referral.title,
        bank: referral.bank,
        department: referral.department,
        level: referral.level,
        salary: referral.salary,
        bonus: referral.bonus,
        description: referral.description,
        requirements: referral.requirements,
        postedBy: referral.postedByName,
        postedDays,
        applicants,
      }
    }),
  )
}

/**
 * Create a referral posting owned by the banker user.
 */
export async function createReferral(
  user: SessionUser,
  payload: {
    title: string
    bank: string
    department: string
    level: string
    salary: string
    bonus: string
    description: string
    requirements: string[]
  },
) {
  const db = await getDb()
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  await referrals.insertOne({
    bankerUserId: user.id,
    postedByName: user.name,
    bank: payload.bank,
    title: payload.title,
    department: payload.department,
    level: payload.level,
    salary: payload.salary,
    bonus: payload.bonus,
    description: payload.description,
    requirements: payload.requirements,
    status: "active",
    createdAt: new Date(),
  })
}

/**
 * Read only the referrals created by the current banker user.
 */
export async function listMyReferrals(userId: string) {
  const db = await getDb()
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const applications = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)

  const rows = await referrals.find({ bankerUserId: userId }).sort({ createdAt: -1 }).toArray()

  return Promise.all(
    rows.map(async (referral) => {
      const applicants = await applications.countDocuments({
        referralId: String((referral as ReferralOpportunity & { _id: ObjectId })._id),
      })
      const postedDays = Math.max(
        1,
        Math.floor((Date.now() - new Date(referral.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      )
      return {
        id: String((referral as ReferralOpportunity & { _id: ObjectId })._id),
        title: referral.title,
        department: referral.department,
        level: referral.level,
        salary: referral.salary,
        bonus: referral.bonus,
        status: referral.status,
        applicants,
        postedDays,
      }
    }),
  )
}

/**
 * Apply to an open referral as a candidate user.
 */
export async function createReferralApplication(
  user: SessionUser,
  payload: {
    referralId: string
    name: string
    email: string
    linkedin: string
    intro: string
  },
) {
  const db = await getDb()
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const applications = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)

  const referral = await referrals.findOne({ _id: toObjectId(payload.referralId), status: "active" })
  if (!referral) {
    throw new Error("Referral not found or no longer active.")
  }

  const existing = await applications.findOne({
    referralId: payload.referralId,
    candidateUserId: user.id,
  })

  if (existing) {
    throw new Error("You already applied to this referral.")
  }

  await applications.insertOne({
    referralId: payload.referralId,
    candidateUserId: user.id,
    name: payload.name,
    email: payload.email,
    linkedin: payload.linkedin,
    intro: payload.intro,
    status: "new",
    createdAt: new Date(),
  })
}

/**
 * Return applicants for a banker-owned referral for the "My Referrals" modal.
 */
export async function listApplicantsForReferral(userId: string, referralId: string) {
  const db = await getDb()
  const referrals = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const applications = db.collection<ReferralApplication>(COLLECTIONS.referralApplications)

  const referral = await referrals.findOne({
    _id: toObjectId(referralId),
    bankerUserId: userId,
  })

  if (!referral) {
    throw new Error("Referral not found.")
  }

  const rows = await applications.find({ referralId }).sort({ createdAt: -1 }).toArray()
  return rows.map((item) => {
    const appliedDays = Math.max(
      1,
      Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    )
    return {
      id: String((item as ReferralApplication & { _id: ObjectId })._id),
      name: item.name,
      email: item.email,
      linkedin: item.linkedin,
      status: item.status,
      appliedDays,
    }
  })
}
