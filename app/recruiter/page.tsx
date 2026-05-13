"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  Search, 
  Users, 
  Coins, 
  FileText, 
  Filter,
  Lock,
  Unlock,
  ChevronDown,
  BadgeCheck,
  Clock,
  DollarSign,
  Briefcase,
  MapPin,
  Plus,
  ArrowUpRight,
  Wallet,
  History,
  CreditCard
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

type CandidateCard = {
  id: string
  title: string
  yearsExp: number
  currentSalary: string
  expectedSalary: string
  skills: string[]
  summary: string
  creditCost: number
  verified: boolean
  postedDays: number
  unlocked: boolean
}

type WalletTransaction = {
  id: string
  type: "earned" | "spent" | "purchased"
  description: string
  credits: number
  date: string
}

export default function RecruiterDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedExperience, setSelectedExperience] = useState("all")
  const [creditBalance, setCreditBalance] = useState(0)
  const [candidates, setCandidates] = useState<CandidateCard[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [statusMessage, setStatusMessage] = useState("")
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateCard | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const [form, setForm] = useState({
    title: "",
    yearsExp: "",
    currentSalary: "",
    expectedSalary: "",
    skills: "",
    summary: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    linkedin: "",
    creditCost: "60",
  })

  /**
   * Pull fresh candidate pool and wallet data from the server.
   */
  async function loadData() {
    const [candidatesResponse, walletResponse] = await Promise.all([
      fetch(API_ENDPOINTS.recruiterCandidates),
      fetch(API_ENDPOINTS.recruiterWallet),
    ])
    const candidatesData = await candidatesResponse.json()
    const walletData = await walletResponse.json()
    if (!candidatesResponse.ok) {
      throw new Error(candidatesData.error || "Unable to load candidates.")
    }
    if (!walletResponse.ok) {
      throw new Error(walletData.error || "Unable to load wallet.")
    }

    setCandidates(candidatesData.candidates)
    setCreditBalance(walletData.balance)
    setTransactions(walletData.transactions)
  }

  useEffect(() => {
    loadData().catch((error) => {
      setStatusMessage(error instanceof Error ? error.message : "Failed to load recruiter data.")
    })
  }, [])

  const filteredCandidates = useMemo(() => candidates.filter(candidate => {
    const matchesSearch = candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDept = selectedDepartment === "all" || candidate.title.toLowerCase().includes(selectedDepartment.toLowerCase())
    const matchesExp = selectedExperience === "all" || 
      (selectedExperience === "junior" && candidate.yearsExp < 5) ||
      (selectedExperience === "mid" && candidate.yearsExp >= 5 && candidate.yearsExp < 10) ||
      (selectedExperience === "senior" && candidate.yearsExp >= 10)
    return matchesSearch && matchesDept && matchesExp
  }), [candidates, searchQuery, selectedDepartment, selectedExperience])

  /**
   * Submit recruiter candidate form and refresh listing after success.
   */
  async function submitCandidate(event: FormEvent) {
    event.preventDefault()
    setIsBusy(true)
    setStatusMessage("")
    try {
      const response = await fetch(API_ENDPOINTS.recruiterCandidates, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          yearsExp: Number(form.yearsExp),
          currentSalary: form.currentSalary,
          expectedSalary: form.expectedSalary,
          skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
          summary: form.summary,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          linkedin: form.linkedin,
          creditCost: Number(form.creditCost),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Candidate submission failed.")
      }
      setForm({
        title: "",
        yearsExp: "",
        currentSalary: "",
        expectedSalary: "",
        skills: "",
        summary: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        linkedin: "",
        creditCost: "60",
      })
      setStatusMessage("Candidate submitted successfully.")
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Candidate submission failed.")
    } finally {
      setIsBusy(false)
    }
  }

  /**
   * Unlock contact information and immediately refresh wallet/transactions.
   */
  async function confirmUnlock() {
    if (!selectedCandidate) {
      return
    }
    setIsBusy(true)
    setStatusMessage("")
    try {
      const response = await fetch(API_ENDPOINTS.recruiterUnlock, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: selectedCandidate.id }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Unlock failed.")
      }
      setStatusMessage(
        `Unlocked contact: ${data.contact.contactName} (${data.contact.contactEmail})`,
      )
      setShowUnlockDialog(false)
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unlock failed.")
    } finally {
      setIsBusy(false)
    }
  }

  /**
   * Provide temporary credit top-up until Stripe checkout is implemented.
   */
  async function topUpCredits(amount: 100 | 500 | 1000) {
    setIsBusy(true)
    setStatusMessage("")
    try {
      const response = await fetch(API_ENDPOINTS.recruiterTopup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Top-up failed.")
      }
      setStatusMessage(`Added ${amount} credits to your wallet.`)
      await loadData()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Top-up failed.")
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
            <Badge variant="secondary" className="hidden sm:flex">Recruiter</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">{creditBalance}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Exit</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {statusMessage ? (
          <p className="mb-4 text-sm text-primary">{statusMessage}</p>
        ) : null}
        <Tabs defaultValue="pool" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pool" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Talent Pool</span>
            </TabsTrigger>
            <TabsTrigger value="submit" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Credits</span>
            </TabsTrigger>
          </TabsList>

          {/* Talent Pool Tab */}
          <TabsContent value="pool" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by role or skill..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="risk">Risk</SelectItem>
                        <SelectItem value="banking">Banking</SelectItem>
                        <SelectItem value="audit">Audit</SelectItem>
                        <SelectItem value="private">Private Banking</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="junior">0-5 years</SelectItem>
                        <SelectItem value="mid">5-10 years</SelectItem>
                        <SelectItem value="senior">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCandidates.length} anonymous profiles
              </p>
              <Badge variant="outline" className="gap-1">
                <BadgeCheck className="w-3 h-3" />
                All Human-Vetted
              </Badge>
            </div>

            {/* Candidate Cards */}
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{candidate.title}</h3>
                              {candidate.verified && (
                                <BadgeCheck className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {candidate.yearsExp} years exp
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                Hong Kong
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Posted {candidate.postedDays}d ago
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {candidate.summary}
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current: </span>
                            <span className="font-medium text-foreground">{candidate.currentSalary}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expected: </span>
                            <span className="font-medium text-foreground">{candidate.expectedSalary}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-center gap-3 lg:min-w-[140px]">
                        <div className="text-center lg:text-right">
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <Coins className="w-4 h-4" />
                            {candidate.creditCost} credits
                          </div>
                          <p className="text-xs text-muted-foreground">to unlock contact</p>
                        </div>
                        <Button 
                          className="gap-2"
                          onClick={() => {
                            setSelectedCandidate(candidate)
                            setShowUnlockDialog(true)
                          }}
                          disabled={candidate.unlocked}
                        >
                          <Unlock className="w-4 h-4" />
                          {candidate.unlocked ? "Unlocked" : "Unlock"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Submit Candidate Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Submit a Candidate
                </CardTitle>
                <CardDescription>
                  Earn 50 credits every time someone unlocks your candidate&apos;s contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={submitCandidate}>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Earn 50 Credits Per Unlock</p>
                      <p className="text-sm text-muted-foreground">Turn your inactive candidates into passive income</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input placeholder="e.g., VP Compliance" value={form.title} onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input type="number" placeholder="e.g., 10" value={form.yearsExp} onChange={(event) => setForm((previous) => ({ ...previous, yearsExp: event.target.value }))} required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Salary (HKD)</Label>
                    <Input placeholder="e.g., 1,800,000" value={form.currentSalary} onChange={(event) => setForm((previous) => ({ ...previous, currentSalary: event.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Salary (HKD)</Label>
                    <Input placeholder="e.g., 2,200,000" value={form.expectedSalary} onChange={(event) => setForm((previous) => ({ ...previous, expectedSalary: event.target.value }))} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Key Skills (comma separated)</Label>
                  <Input placeholder="e.g., AML, KYC, Team Leadership" value={form.skills} onChange={(event) => setForm((previous) => ({ ...previous, skills: event.target.value }))} required />
                </div>

                <div className="space-y-2">
                  <Label>Anonymous Summary</Label>
                  <Textarea 
                    placeholder="Write a compelling summary without revealing the candidate's identity..."
                    rows={4}
                    value={form.summary}
                    onChange={(event) => setForm((previous) => ({ ...previous, summary: event.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Do not include names, company names, or any identifying information.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-4">Contact Details (Hidden until unlocked)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Candidate Name</Label>
                      <Input placeholder="Full name" value={form.contactName} onChange={(event) => setForm((previous) => ({ ...previous, contactName: event.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="email@example.com" value={form.contactEmail} onChange={(event) => setForm((previous) => ({ ...previous, contactEmail: event.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input placeholder="+852 XXXX XXXX" value={form.contactPhone} onChange={(event) => setForm((previous) => ({ ...previous, contactPhone: event.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL (optional)</Label>
                      <Input placeholder="linkedin.com/in/..." value={form.linkedin} onChange={(event) => setForm((previous) => ({ ...previous, linkedin: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Credit Cost to Unlock</Label>
                      <Input type="number" placeholder="e.g., 60" value={form.creditCost} onChange={(event) => setForm((previous) => ({ ...previous, creditCost: event.target.value }))} required />
                    </div>
                  </div>
                </div>

                <Button className="w-full md:w-auto" disabled={isBusy} type="submit">
                  Submit Candidate for Review
                </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            {/* Balance Card */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-4xl font-bold text-foreground">{creditBalance}</p>
                    <p className="text-sm text-muted-foreground">credits</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Buy Credits</CardTitle>
                  <CardDescription>Purchase credit packs to unlock more candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { credits: 100, price: 500, popular: false },
                      { credits: 500, price: 2000, popular: true },
                      { credits: 1000, price: 3500, popular: false },
                    ].map((pack) => (
                      <button
                        type="button"
                        key={pack.credits}
                        className={`relative p-4 rounded-lg border-2 text-center transition-colors hover:border-primary/50 ${
                          pack.popular ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => topUpCredits(pack.credits as 100 | 500 | 1000)}
                        disabled={isBusy}
                      >
                        {pack.popular && (
                          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
                            Popular
                          </Badge>
                        )}
                        <p className="text-2xl font-bold text-foreground">{pack.credits}</p>
                        <p className="text-xs text-muted-foreground mb-2">credits</p>
                        <p className="text-sm font-medium text-primary">HKD {pack.price}</p>
                      </button>
                    ))}
                  </div>
                  <Button className="w-full mt-4 gap-2">
                    <CreditCard className="w-4 h-4" />
                    Stripe Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="w-5 h-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "earned" ? "bg-green-100 text-green-600" :
                          tx.type === "spent" ? "bg-red-100 text-red-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          {tx.type === "earned" ? <ArrowUpRight className="w-4 h-4" /> :
                           tx.type === "spent" ? <Unlock className="w-4 h-4" /> :
                           <CreditCard className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        tx.credits > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {tx.credits > 0 ? "+" : ""}{tx.credits}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Candidate Contact</DialogTitle>
            <DialogDescription>
              You are about to unlock the contact details for this candidate.
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium text-foreground">{selectedCandidate.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedCandidate.yearsExp} years experience</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <span className="text-muted-foreground">Cost</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Coins className="w-4 h-4 text-primary" />
                  {selectedCandidate.creditCost} credits
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <span className="text-muted-foreground">Your Balance After</span>
                <span className="font-semibold text-foreground">
                  {creditBalance - selectedCandidate.creditCost} credits
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={confirmUnlock} disabled={isBusy}>
              <Unlock className="w-4 h-4" />
              Confirm Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
