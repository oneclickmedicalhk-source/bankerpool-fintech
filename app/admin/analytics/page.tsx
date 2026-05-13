"use client"

import { useEffect, useState } from "react"
import { Eye, Users, Briefcase, UserCheck, Calendar, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

export default function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [analytics, setAnalytics] = useState<any>(null)
  const [statusMessage, setStatusMessage] = useState("")

  /**
   * Load analytics snapshot for selected date range.
   */
  async function loadAnalytics(selectedRange: "7d" | "30d" | "90d" | "1y") {
    const response = await fetch(`${API_ENDPOINTS.adminAnalytics}?range=${selectedRange}`)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to load analytics.")
    }
    setAnalytics(data)
  }

  useEffect(() => {
    void loadAnalytics(range).catch((error) =>
      setStatusMessage(error instanceof Error ? error.message : "Failed to load analytics."),
    )
  }, [range])

  /**
   * Download analytics export CSV for current report context.
   */
  function exportAnalytics() {
    window.open(API_ENDPOINTS.adminAnalyticsExport("analytics"), "_blank")
  }

  if (!analytics) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(value) => setRange(value as "7d" | "30d" | "90d" | "1y")}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportAnalytics}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-primary">{statusMessage}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6"><Eye className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.metrics.pageViews}</p><p className="text-sm text-muted-foreground">Total Page Views</p></CardContent></Card>
        <Card><CardContent className="pt-6"><Users className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.metrics.newUsers}</p><p className="text-sm text-muted-foreground">New Users</p></CardContent></Card>
        <Card><CardContent className="pt-6"><Briefcase className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.metrics.jobsPosted}</p><p className="text-sm text-muted-foreground">Jobs Posted</p></CardContent></Card>
        <Card><CardContent className="pt-6"><UserCheck className="w-5 h-5 text-primary mb-2" /><p className="text-2xl font-bold">{analytics.metrics.referralConversions}</p><p className="text-sm text-muted-foreground">Referral Conversions</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topPages.map((page: any) => (
              <div key={page.path} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">{page.path}</span>
                <Badge variant="secondary">{page.views.toLocaleString()} views</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Operational status summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>Uptime</span><Badge>{analytics.health.uptime}</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>Response Time</span><Badge>{analytics.health.responseTime}</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>Error Rate</span><Badge>{analytics.health.errorRate}</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span>Active Sessions</span><Badge>{analytics.health.activeSessions}</Badge></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
