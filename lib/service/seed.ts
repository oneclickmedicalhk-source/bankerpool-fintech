import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import type { CultureReview, ReferralOpportunity, SalaryIntel } from "@/lib/model/types"

let hasSeeded = false

/**
 * Insert baseline marketplace data once so dashboards are not empty on first run.
 */
export async function ensureSeedData() {
  if (hasSeeded) {
    return
  }

  const db = await getDb()
  const reviewsCol = db.collection<CultureReview>(COLLECTIONS.cultureReviews)
  const referralsCol = db.collection<ReferralOpportunity>(COLLECTIONS.referrals)
  const salariesCol = db.collection<SalaryIntel>(COLLECTIONS.salaryIntel)

  const existingReviews = await reviewsCol.countDocuments()
  if (existingReviews === 0) {
    await reviewsCol.insertMany([
      {
        authorUserId: "seed",
        authorRole: "banker",
        bank: "HSBC",
        department: "Compliance",
        rating: 4,
        title: "Good work-life balance, but bureaucratic",
        content:
          "Decent culture overall. WLB is respected in my team. Promotion can be slow due to matrix structure.",
        pros: ["Work-life balance", "Training programs", "Job stability"],
        cons: ["Bureaucracy", "Slow promotion"],
        helpful: 16,
        createdAt: new Date(),
      },
      {
        authorUserId: "seed",
        authorRole: "candidate",
        bank: "Standard Chartered",
        department: "Risk Management",
        rating: 3,
        title: "High pressure but good exposure",
        content: "Fast-paced environment with plenty of exposure. Team quality varies by desk.",
        pros: ["Good exposure", "International mobility"],
        cons: ["Long hours", "Frequent reorgs"],
        helpful: 10,
        createdAt: new Date(),
      },
    ])
  }

  const existingReferrals = await referralsCol.countDocuments()
  if (existingReferrals === 0) {
    await referralsCol.insertMany([
      {
        bankerUserId: "seed",
        postedByName: "Hiring Manager",
        bank: "Major US Bank",
        title: "VP, AML Compliance",
        department: "Financial Crimes",
        level: "VP",
        salary: "HKD 1.8M - 2.2M",
        bonus: "HKD 30,000",
        description: "Looking for a strong AML professional with 8+ years experience.",
        requirements: ["8+ years AML experience", "CAMS certification", "Team lead experience"],
        status: "active",
        createdAt: new Date(),
      },
      {
        bankerUserId: "seed",
        postedByName: "VP",
        bank: "Bulge Bracket",
        title: "Associate, M&A",
        department: "Investment Banking",
        level: "Associate",
        salary: "HKD 1.2M - 1.5M",
        bonus: "HKD 20,000",
        description: "Looking for a sharp associate with 3-5 years M&A experience.",
        requirements: ["3-5 years IB experience", "Financial modeling", "Mandarin fluent"],
        status: "active",
        createdAt: new Date(),
      },
    ])
  }

  const existingSalaries = await salariesCol.countDocuments()
  if (existingSalaries === 0) {
    await salariesCol.insertMany([
      {
        role: "VP Compliance",
        bank: "Tier 1 Bank",
        range: "HKD 1.5M - 2.2M",
        bonus: "2-4 months",
        reports: 12,
        createdAt: new Date(),
      },
      {
        role: "Director Risk",
        bank: "US Bulge Bracket",
        range: "HKD 2.5M - 3.5M",
        bonus: "50-100%",
        reports: 8,
        createdAt: new Date(),
      },
    ])
  }

  hasSeeded = true
}
