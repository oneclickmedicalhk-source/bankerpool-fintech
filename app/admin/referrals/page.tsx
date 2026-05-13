"use client"

import { useEffect, useMemo, useState } from "react"
import { UserCheck, Search, MoreHorizontal, Eye, CheckCircle2, Clock, XCircle, Building2, DollarSign, Coins, ThumbsUp, ThumbsDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

export default function ReferralsManagement() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [counts, setCounts] = useState({ total: 0, active: 0, completed: 0, pending: 0, totalBonus: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  /**
   * Load referrals admin listing with filters.
   */
  async function loadReferrals() {
    const params = new URLSearchParams({ query: searchQuery, status: statusFilter })
    const response = await fetch(`${API_ENDPOINTS.adminReferrals}?${params.toString()}`)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to load referrals.")
    }
    setReferrals(data.referrals)
    setCounts(data.counts)
  }

  useEffect(() => {
    void loadReferrals().catch((error) => setStatusMessage(error instanceof Error ? error.message : "Failed to load referrals."))
  }, [searchQuery, statusFilter])

  const pendingReferrals = useMemo(() => referrals.filter((item) => item.status === "pending"), [referrals])

  /**
   * Update referral application review status.
   */
  async function updateStatus(id: string, status: "new" | "reviewed" | "referred") {
    const response = await fetch(API_ENDPOINTS.adminReferralStatus(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to update referral.")
      return
    }
    await loadReferrals()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Referrals Management</h1>
        <p className="text-muted-foreground">Track and manage all referral submissions</p>
      </div>

      {statusMessage ? <p className="text-sm text-primary">{statusMessage}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.total}</p><p className="text-sm text-muted-foreground">Total Referrals</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.active}</p><p className="text-sm text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.completed}</p><p className="text-sm text-muted-foreground">Successful Hires</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">HKD {counts.totalBonus}</p><p className="text-sm text-muted-foreground">Total Bonuses</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Referrals</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification ({pendingReferrals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Referrals</CardTitle>
              <CardDescription>{referrals.length} referrals found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search referrals..." />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="p-4 rounded-lg border border-border">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <Avatar className="w-10 h-10"><AvatarFallback>{referral.avatar}</AvatarFallback></Avatar>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{referral.candidateName}</h3>
                            <Badge variant="secondary">{referral.stage}</Badge>
                            <Badge>{referral.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{referral.candidateTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.referrerName} {"->"} {referral.targetCompany} ({referral.targetRole})
                          </p>
                          <p className="text-sm font-medium text-green-700">{referral.bonus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedReferral(referral); setShowDetailDialog(true) }}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => void updateStatus(referral.id, "reviewed")}>Mark Interview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void updateStatus(referral.id, "referred")}>Mark Hired</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void updateStatus(referral.id, "new")}>Reset to New</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingReferrals.map((referral) => (
                <div key={referral.id} className="p-4 rounded-lg border border-yellow-300 bg-yellow-50/40 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{referral.candidateName}</p>
                    <p className="text-sm text-muted-foreground">{referral.targetCompany}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-1" onClick={() => void updateStatus(referral.id, "reviewed")}>
                      <ThumbsUp className="w-4 h-4" /> Verify
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => void updateStatus(referral.id, "new")}>
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
            <DialogDescription>Complete referral information</DialogDescription>
          </DialogHeader>
          {selectedReferral ? (
            <div className="space-y-3">
              <p><strong>Candidate:</strong> {selectedReferral.candidateName}</p>
              <p><strong>Referrer:</strong> {selectedReferral.referrerName}</p>
              <p><strong>Target:</strong> {selectedReferral.targetCompany} - {selectedReferral.targetRole}</p>
              <p><strong>Bonus:</strong> {selectedReferral.bonus}</p>
              <p><strong>Status:</strong> {selectedReferral.status}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
