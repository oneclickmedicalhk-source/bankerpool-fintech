"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  MessageSquare, 
  DollarSign, 
  Briefcase, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Plus,
  Users,
  BadgeCheck,
  Send,
  Eye,
  TrendingUp,
  Edit,
  Trash2,
  Building,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

type ReviewRecord = {
  id: string
  bank: string
  department: string
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  postedDays: number
  helpful: number
  verified: boolean
}

type ReferralRecord = {
  id: string
  title: string
  bank?: string
  department: string
  level: string
  salary: string
  bonus: string
  description?: string
  postedBy?: string
  status: "active" | "closed"
  applicants: number
  postedDays: number
}

type SalaryRecord = {
  id: string
  role: string
  bank: string
  range: string
  bonus: string
  reports: number
}

type ApplicantRecord = {
  id: string
  name: string
  email: string
  linkedin: string
  appliedDays: number
  status: string
}

export default function BankerDashboard() {
  const [showPostReferralDialog, setShowPostReferralDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showApplicantsDialog, setShowApplicantsDialog] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null)
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [myReferrals, setMyReferrals] = useState<ReferralRecord[]>([])
  const [otherReferrals, setOtherReferrals] = useState<ReferralRecord[]>([])
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([])
  const [referralApplicants, setReferralApplicants] = useState<ApplicantRecord[]>([])
  const [statusMessage, setStatusMessage] = useState("")
  const [isBusy, setIsBusy] = useState(false)
  const [referralForm, setReferralForm] = useState({
    title: "",
    level: "",
    bank: "",
    department: "",
    salary: "",
    bonus: "",
    description: "",
    requirements: "",
  })
  const [reviewForm, setReviewForm] = useState({
    bank: "",
    department: "",
    rating: 4,
    title: "",
    content: "",
    pros: "",
    cons: "",
  })

  /**
   * Load banker-specific data: own referrals, marketplace referrals, reviews, and salaries.
   */
  async function loadData() {
    const [mineRes, allReferralsRes, reviewsRes, salariesRes] = await Promise.all([
      fetch(API_ENDPOINTS.bankerMyReferrals),
      fetch(API_ENDPOINTS.referrals),
      fetch(API_ENDPOINTS.reviews),
      fetch(API_ENDPOINTS.salaries),
    ])
    const mineData = await mineRes.json()
    const allData = await allReferralsRes.json()
    const reviewsData = await reviewsRes.json()
    const salariesData = await salariesRes.json()

    if (!mineRes.ok) {
      throw new Error(mineData.error || "Failed to load your referrals.")
    }
    if (!allReferralsRes.ok) {
      throw new Error(allData.error || "Failed to load referrals.")
    }
    if (!reviewsRes.ok) {
      throw new Error(reviewsData.error || "Failed to load reviews.")
    }
    if (!salariesRes.ok) {
      throw new Error(salariesData.error || "Failed to load salaries.")
    }

    setMyReferrals(mineData.referrals)
    setOtherReferrals(allData.referrals)
    setReviews(reviewsData.reviews)
    setSalaryData(salariesData.salaries)
  }

  useEffect(() => {
    loadData().catch((error) => {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load dashboard data.")
    })
  }, [])

  /**
   * Create a banker referral posting and refresh both listing tabs.
   */
  async function submitReferral(event: FormEvent) {
    event.preventDefault()
    setIsBusy(true)
    setStatusMessage("")
    try {
      const response = await fetch(API_ENDPOINTS.referrals, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: referralForm.title,
          level: referralForm.level,
          bank: referralForm.bank,
          department: referralForm.department,
          salary: referralForm.salary,
          bonus: referralForm.bonus,
          description: referralForm.description,
          requirements: referralForm.requirements.split("\n").map((item) => item.trim()).filter(Boolean),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to post referral.")
      }

      setShowPostReferralDialog(false)
      setReferralForm({
        title: "",
        level: "",
        bank: "",
        department: "",
        salary: "",
        bonus: "",
        description: "",
        requirements: "",
      })
      setStatusMessage("Referral posted successfully.")
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to post referral.")
    } finally {
      setIsBusy(false)
    }
  }

  /**
   * Submit a banker culture review to the shared review feed.
   */
  async function submitReview(event: FormEvent) {
    event.preventDefault()
    setIsBusy(true)
    setStatusMessage("")
    try {
      const response = await fetch(API_ENDPOINTS.reviews, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank: reviewForm.bank,
          department: reviewForm.department,
          rating: reviewForm.rating,
          title: reviewForm.title,
          content: reviewForm.content,
          pros: reviewForm.pros.split(",").map((item) => item.trim()).filter(Boolean),
          cons: reviewForm.cons.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review.")
      }
      setShowReviewDialog(false)
      setReviewForm({
        bank: "",
        department: "",
        rating: 4,
        title: "",
        content: "",
        pros: "",
        cons: "",
      })
      setStatusMessage("Review submitted.")
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to submit review.")
    } finally {
      setIsBusy(false)
    }
  }

  /**
   * Fetch applicants for a selected banker-owned referral.
   */
  async function openApplicants(referral: ReferralRecord) {
    setSelectedReferral(referral)
    setShowApplicantsDialog(true)
    try {
      const response = await fetch(API_ENDPOINTS.bankerReferralApplicants(referral.id))
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to load applicants.")
      }
      setReferralApplicants(data.applicants)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load applicants.")
      setReferralApplicants([])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BankerPool</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:flex">
              <BadgeCheck className="w-3 h-3 mr-1" />
              Verified Banker
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Exit</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {statusMessage ? <p className="mb-4 text-sm text-primary">{statusMessage}</p> : null}
        <Tabs defaultValue="my-referrals" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="my-referrals" className="gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">My Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="all-referrals" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">All Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="salaries" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Salaries</span>
            </TabsTrigger>
          </TabsList>

          {/* My Referrals Tab */}
          <TabsContent value="my-referrals" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{myReferrals.length}</p>
                      <p className="text-sm text-muted-foreground">Active Postings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {myReferrals.reduce((sum, r) => sum + r.applicants, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Applicants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">HKD 45K</p>
                      <p className="text-sm text-muted-foreground">Potential Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Post New Referral CTA */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Have a role to fill?</h3>
                      <p className="text-sm text-muted-foreground">Post a referral opportunity and earn bonus when you refer someone</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowPostReferralDialog(true)} className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Post Referral
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Referral Listings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Your Active Postings</h3>
              {myReferrals.map((referral) => (
                <Card key={referral.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{referral.title}</h4>
                          <Badge variant={referral.status === "active" ? "default" : "secondary"}>
                            {referral.status === "active" ? "Active" : "Closed"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>{referral.department}</span>
                          <span>{referral.salary}</span>
                          <span>Bonus: {referral.bonus}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            void openApplicants(referral)
                          }}
                        >
                          <Users className="w-4 h-4" />
                          {referral.applicants} Applicants
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Referrals Tab */}
          <TabsContent value="all-referrals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">All Referral Opportunities</h2>
                <p className="text-sm text-muted-foreground">Browse referrals posted by other verified bankers</p>
              </div>
            </div>

            <div className="space-y-4">
              {otherReferrals.map((referral) => (
                <Card key={referral.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-foreground">{referral.title}</h3>
                            <Badge variant="secondary">{referral.level}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5" />
                              {referral.bank}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {referral.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {referral.postedDays}d ago
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{referral.salary}</p>
                          <p className="text-xs text-primary">Referral bonus: {referral.bonus}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{referral.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4 text-primary" />
                            Posted by {referral.postedBy}
                          </span>
                          <span>{referral.applicants} applicants</span>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Culture Reviews</h2>
                <p className="text-sm text-muted-foreground">Share your experience to help the community</p>
              </div>
              <Button onClick={() => setShowReviewDialog(true)} className="gap-2 w-full sm:w-auto">
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </Button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{review.bank}</h3>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <BadgeCheck className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{review.department}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-green-600 mb-2">Pros</p>
                          <div className="flex flex-wrap gap-1">
                            {review.pros.map((pro, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {pro}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-600 mb-2">Cons</p>
                          <div className="flex flex-wrap gap-1">
                            {review.cons.map((con, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {con}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Posted {review.postedDays} days ago
                        </span>
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            {review.helpful}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Salaries Tab */}
          <TabsContent value="salaries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Salary Benchmarks</h2>
                <p className="text-sm text-muted-foreground">Anonymous salary data from verified bankers</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your Salary
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bank Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Base Salary</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bonus</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryData.map((salary) => (
                        <tr key={salary.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{salary.role}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{salary.bank}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{salary.range}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{salary.bonus}</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className="text-xs">{salary.reports} reports</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Referral Dialog */}
      <Dialog open={showPostReferralDialog} onOpenChange={setShowPostReferralDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post a Referral Opportunity</DialogTitle>
            <DialogDescription>
              Share a role from your team and earn referral bonus when you refer someone
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitReferral}>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">You&apos;ll earn a referral bonus when you successfully refer a candidate</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input placeholder="e.g., VP Compliance" value={referralForm.title} onChange={(event) => setReferralForm((previous) => ({ ...previous, title: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={referralForm.level} onValueChange={(value) => setReferralForm((previous) => ({ ...previous, level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="associate">Associate</SelectItem>
                    <SelectItem value="avp">AVP</SelectItem>
                    <SelectItem value="vp">VP</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="md">MD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={referralForm.department} onValueChange={(value) => setReferralForm((previous) => ({ ...previous, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="risk">Risk Management</SelectItem>
                  <SelectItem value="ib">Investment Banking</SelectItem>
                  <SelectItem value="pb">Private Banking</SelectItem>
                  <SelectItem value="ops">Operations</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Salary Range (HKD)</Label>
                <Input placeholder="e.g., 1.5M - 2.0M" value={referralForm.salary} onChange={(event) => setReferralForm((previous) => ({ ...previous, salary: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Referral Bonus (HKD)</Label>
                <Input placeholder="e.g., 30,000" value={referralForm.bonus} onChange={(event) => setReferralForm((previous) => ({ ...previous, bonus: event.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bank</Label>
              <Input placeholder="e.g., HSBC" value={referralForm.bank} onChange={(event) => setReferralForm((previous) => ({ ...previous, bank: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Role Description</Label>
              <Textarea placeholder="Describe the role, team, and ideal candidate profile..." rows={4} value={referralForm.description} onChange={(event) => setReferralForm((previous) => ({ ...previous, description: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Key Requirements (one per line)</Label>
              <Textarea placeholder="8+ years experience in AML&#10;CAMS certification&#10;Team lead experience" rows={3} value={referralForm.requirements} onChange={(event) => setReferralForm((previous) => ({ ...previous, requirements: event.target.value }))} required />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostReferralDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={(event) => void submitReferral(event as unknown as FormEvent)} disabled={isBusy}>
              <Send className="w-4 h-4" />
              Post Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Write a Culture Review</DialogTitle>
            <DialogDescription>
              Share your experience anonymously to help others
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submitReview}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select value={reviewForm.bank} onValueChange={(value) => setReviewForm((previous) => ({ ...previous, bank: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hsbc">HSBC</SelectItem>
                    <SelectItem value="sc">Standard Chartered</SelectItem>
                    <SelectItem value="gs">Goldman Sachs</SelectItem>
                    <SelectItem value="ms">Morgan Stanley</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={reviewForm.department} onValueChange={(value) => setReviewForm((previous) => ({ ...previous, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="ib">Investment Banking</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm((previous) => ({ ...previous, rating: Number(event.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Review Title</Label>
              <Input placeholder="Summarize your experience" value={reviewForm.title} onChange={(event) => setReviewForm((previous) => ({ ...previous, title: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Your Review</Label>
              <Textarea placeholder="Share details about culture, work-life balance, compensation, career growth..." rows={4} value={reviewForm.content} onChange={(event) => setReviewForm((previous) => ({ ...previous, content: event.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Pros (comma separated)</Label>
                <Input placeholder="e.g., Good WLB, Training" value={reviewForm.pros} onChange={(event) => setReviewForm((previous) => ({ ...previous, pros: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Cons (comma separated)</Label>
                <Input placeholder="e.g., Long hours, Politics" value={reviewForm.cons} onChange={(event) => setReviewForm((previous) => ({ ...previous, cons: event.target.value }))} required />
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={(event) => void submitReview(event as unknown as FormEvent)} disabled={isBusy}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Applicants Dialog */}
      <Dialog open={showApplicantsDialog} onOpenChange={setShowApplicantsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Applicants</DialogTitle>
            <DialogDescription>
              {selectedReferral?.title} - {selectedReferral?.applicants} applicants
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {referralApplicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{applicant.name}</p>
                    {applicant.status === "new" && (
                      <Badge variant="default" className="text-xs">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{applicant.email}</p>
                  <p className="text-xs text-muted-foreground">Applied {applicant.appliedDays}d ago</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button size="sm" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Refer
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicantsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
