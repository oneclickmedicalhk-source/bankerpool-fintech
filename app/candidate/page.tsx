"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
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
  MapPin,
  Filter,
  Search,
  Send,
  Eye,
  TrendingUp,
  Users,
  BadgeCheck,
  ChevronRight,
  Building
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

type SalaryRecord = {
  id: string
  role: string
  bank: string
  range: string
  bonus: string
  reports: number
}

type ReferralRecord = {
  id: string
  title: string
  bank: string
  department: string
  level: string
  salary: string
  bonus: string
  description: string
  requirements: string[]
  postedBy: string
  postedDays: number
  applicants: number
}

export default function CandidateDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBank, setSelectedBank] = useState("all")
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [referrals, setReferrals] = useState<ReferralRecord[]>([])
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [isBusy, setIsBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [applyForm, setApplyForm] = useState({ name: "", email: "", linkedin: "", intro: "" })
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
   * Load all candidate-facing marketplace data sets from APIs.
   */
  async function loadData() {
    const [reviewsRes, referralsRes, salariesRes] = await Promise.all([
      fetch(API_ENDPOINTS.reviews),
      fetch(API_ENDPOINTS.referrals),
      fetch(API_ENDPOINTS.salaries),
    ])
    const reviewsData = await reviewsRes.json()
    const referralsData = await referralsRes.json()
    const salariesData = await salariesRes.json()

    if (!reviewsRes.ok) {
      throw new Error(reviewsData.error || "Failed to load reviews.")
    }
    if (!referralsRes.ok) {
      throw new Error(referralsData.error || "Failed to load referrals.")
    }
    if (!salariesRes.ok) {
      throw new Error(salariesData.error || "Failed to load salaries.")
    }

    setReviews(reviewsData.reviews)
    setReferrals(referralsData.referrals)
    setSalaries(salariesData.salaries)
  }

  useEffect(() => {
    loadData().catch((error) => {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load dashboard data.")
    })
  }, [])

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const byText =
          review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase())
        const byBank =
          selectedBank === "all" || review.bank.toLowerCase().includes(selectedBank.toLowerCase())
        return byText && byBank
      }),
    [reviews, searchQuery, selectedBank],
  )

  /**
   * Submit candidate application payload for currently selected referral.
   */
  async function submitApplication(event: FormEvent) {
    event.preventDefault()
    if (!selectedReferral) {
      return
    }
    setIsBusy(true)
    setStatusMessage("")
    try {
      const response = await fetch(API_ENDPOINTS.referralApply(selectedReferral.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application.")
      }
      setStatusMessage("Referral application submitted successfully.")
      setShowApplyDialog(false)
      setApplyForm({ name: "", email: "", linkedin: "", intro: "" })
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to submit application.")
    } finally {
      setIsBusy(false)
    }
  }

  /**
   * Submit a new culture review and refresh review list.
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
      setStatusMessage("Review submitted successfully.")
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
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to submit review.")
    } finally {
      setIsBusy(false)
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
              <Eye className="w-3 h-3 mr-1" />
              Candidate
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
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Referrals</span>
            </TabsTrigger>
            <TabsTrigger value="salaries" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Salaries</span>
            </TabsTrigger>
          </TabsList>

          {/* Culture Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    className="pl-10 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="All Banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Banks</SelectItem>
                    <SelectItem value="hsbc">HSBC</SelectItem>
                    <SelectItem value="sc">Standard Chartered</SelectItem>
                    <SelectItem value="gs">Goldman Sachs</SelectItem>
                    <SelectItem value="ms">Morgan Stanley</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowReviewDialog(true)} className="gap-2 w-full sm:w-auto">
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </Button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.map((review) => (
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

          {/* Referral Opportunities Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Referral Opportunities</h2>
                <p className="text-sm text-muted-foreground">Direct referrals from verified bankers</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                {referrals.length} Active
              </Badge>
            </div>

            <div className="space-y-4">
              {referrals.map((referral) => (
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

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Requirements</p>
                        <div className="flex flex-wrap gap-1.5">
                          {referral.requirements.map((req, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4 text-primary" />
                            Posted by {referral.postedBy}
                          </span>
                          <span>{referral.applicants} applicants</span>
                        </div>
                        <Button 
                          className="gap-2"
                          onClick={() => {
                            setSelectedReferral(referral)
                            setShowApplyDialog(true)
                          }}
                        >
                          <Send className="w-4 h-4" />
                          Apply for Referral
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Salary Intel Tab */}
          <TabsContent value="salaries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Salary Benchmarks</h2>
                <p className="text-sm text-muted-foreground">Anonymous salary data from verified bankers</p>
              </div>
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
                      {salaries.map((salary) => (
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

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Contribute Salary Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your salary anonymously to help the community. All data is verified and aggregated.
                    </p>
                  </div>
                  <Button variant="outline" className="shrink-0">
                    Add Your Salary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Apply for Referral Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Referral</DialogTitle>
            <DialogDescription>
              Submit your details to be referred for this position
            </DialogDescription>
          </DialogHeader>
          {selectedReferral && (
            <form className="space-y-4" onSubmit={submitApplication}>
              <div className="p-3 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground">{selectedReferral.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedReferral.bank}</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input placeholder="Full name" value={applyForm.name} onChange={(event) => setApplyForm((previous) => ({ ...previous, name: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" value={applyForm.email} onChange={(event) => setApplyForm((previous) => ({ ...previous, email: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn Profile</Label>
                  <Input placeholder="linkedin.com/in/..." value={applyForm.linkedin} onChange={(event) => setApplyForm((previous) => ({ ...previous, linkedin: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Brief Introduction</Label>
                  <Textarea placeholder="Why are you a good fit for this role?" rows={3} value={applyForm.intro} onChange={(event) => setApplyForm((previous) => ({ ...previous, intro: event.target.value }))} required />
                </div>
              </div>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={(event) => void submitApplication(event as unknown as FormEvent)} disabled={isBusy}>
              <Send className="w-4 h-4" />
              Submit Application
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
    </div>
  )
}
