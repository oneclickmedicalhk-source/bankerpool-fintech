"use client"

import { useEffect, useMemo, useState } from "react"
import { Briefcase, Search, Plus, Eye, CheckCircle2, Clock, XCircle, AlertTriangle, Building2, MapPin, DollarSign, Pencil, Trash2, ThumbsUp, ThumbsDown, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

export default function JobPostsManagement() {
  const [jobs, setJobs] = useState<any[]>([])
  const [counts, setCounts] = useState({ total: 0, active: 0, pending: 0, applications: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    department: "",
    location: "",
    salary: "",
    status: "pending",
    featured: false,
  })

  /**
   * Fetch jobs list and summary counts from admin API.
   */
  async function loadJobs() {
    const params = new URLSearchParams({ query: searchQuery, status: statusFilter })
    const response = await fetch(`${API_ENDPOINTS.adminJobs}?${params.toString()}`)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to load jobs.")
    }
    setJobs(data.jobs)
    setCounts(data.counts)
  }

  useEffect(() => {
    void loadJobs().catch((error) => setStatusMessage(error instanceof Error ? error.message : "Failed to load jobs."))
  }, [searchQuery, statusFilter])

  const pendingJobs = useMemo(() => jobs.filter((job) => job.status === "pending"), [jobs])

  /**
   * Create job post directly from admin panel.
   */
  async function createJob() {
    const response = await fetch(API_ENDPOINTS.adminJobs, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newJob),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to create job.")
      return
    }
    setStatusMessage("Job created.")
    setNewJob({
      title: "",
      company: "",
      department: "",
      location: "",
      salary: "",
      status: "pending",
      featured: false,
    })
    await loadJobs()
  }

  /**
   * Apply workflow updates like approve, reject, expire for one job.
   */
  async function updateJob(id: string, updates: Record<string, unknown>) {
    const response = await fetch(API_ENDPOINTS.adminJobById(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to update job.")
      return
    }
    await loadJobs()
  }

  /**
   * Delete one job row from admin list.
   */
  async function deleteJob(id: string) {
    const response = await fetch(API_ENDPOINTS.adminJobById(id), { method: "DELETE" })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to delete job.")
      return
    }
    setStatusMessage("Job deleted.")
    await loadJobs()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Job Posts Management</h1>
          <p className="text-muted-foreground">Review and manage all job postings</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Title" value={newJob.title} onChange={(event) => setNewJob((prev) => ({ ...prev, title: event.target.value }))} />
          <Input placeholder="Company" value={newJob.company} onChange={(event) => setNewJob((prev) => ({ ...prev, company: event.target.value }))} />
          <Button size="sm" className="gap-2" onClick={() => void createJob()}>
            <Plus className="w-4 h-4" />
            Create Job
          </Button>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-primary">{statusMessage}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.total}</p><p className="text-sm text-muted-foreground">Total Jobs</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.active}</p><p className="text-sm text-muted-foreground">Active Jobs</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.pending}</p><p className="text-sm text-muted-foreground">Pending Review</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.applications}</p><p className="text-sm text-muted-foreground">Total Applications</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="pending">Pending Review ({pendingJobs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Job Posts</CardTitle>
              <CardDescription>{jobs.length} jobs found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search jobs..." />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-lg border border-border">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="secondary">{job.status}</Badge>
                          {job.featured ? <Badge>Featured</Badge> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{job.salary}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Applications: {job.applications}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === "pending" ? (
                          <>
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => void updateJob(job.id, { status: "active" })}>
                              <ThumbsUp className="w-4 h-4" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => void updateJob(job.id, { status: "rejected" })}>
                              <ThumbsDown className="w-4 h-4" /> Reject
                            </Button>
                          </>
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedJob(job); setShowReviewDialog(true) }}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void updateJob(job.id, { featured: !job.featured })}>
                              <Pencil className="w-4 h-4 mr-2" /> Toggle Featured
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void updateJob(job.id, { status: "expired" })}>
                              <AlertTriangle className="w-4 h-4 mr-2" /> Mark Expired
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => void deleteJob(job.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
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
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Jobs waiting for admin approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg border border-yellow-300 bg-yellow-50/40 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void updateJob(job.id, { status: "active" })}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => void updateJob(job.id, { status: "rejected" })}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>Review this job post before moderation decision.</DialogDescription>
          </DialogHeader>
          {selectedJob ? (
            <div className="space-y-2">
              <p><strong>Title:</strong> {selectedJob.title}</p>
              <p><strong>Company:</strong> {selectedJob.company}</p>
              <p><strong>Department:</strong> {selectedJob.department}</p>
              <p><strong>Salary:</strong> {selectedJob.salary}</p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
