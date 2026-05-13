"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  DollarSign,
  ArrowUpRight,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", change: "+0%", trend: "up", icon: Users },
    { title: "Active Job Posts", value: "0", change: "+0%", trend: "up", icon: Briefcase },
    { title: "Active Referrals", value: "0", change: "+0%", trend: "up", icon: UserCheck },
    { title: "Page Views", value: "0", change: "+0%", trend: "up", icon: Eye },
  ])
  const [recentActivity, setRecentActivity] = useState<
    Array<{ id: string; user: string; action: string; type: string; time: string; avatar: string }>
  >([])
  const [pendingItems, setPendingItems] = useState<Array<{ id: number; type: string; count: number; priority: string }>>([])

  /**
   * Fetch dashboard metrics, activity feed, and pending review queues.
   */
  useEffect(() => {
    void fetch(API_ENDPOINTS.adminDashboard)
      .then((response) => response.json())
      .then((data) => {
        setStats([
          {
            title: "Total Users",
            value: String(data.stats.totalUsers || 0),
            change: "+0%",
            trend: "up",
            icon: Users,
          },
          {
            title: "Active Job Posts",
            value: String(data.stats.activeJobs || 0),
            change: "+0%",
            trend: "up",
            icon: Briefcase,
          },
          {
            title: "Active Referrals",
            value: String(data.stats.activeReferrals || 0),
            change: "+0%",
            trend: "up",
            icon: UserCheck,
          },
          {
            title: "Page Views",
            value: String(data.stats.pageViews || 0),
            change: "+0%",
            trend: "up",
            icon: Eye,
          },
        ])
        setRecentActivity(
          (data.activity || []).map((item: { id: string; user: string; action: string; type: string; time: string }) => ({
            id: item.id,
            user: item.user,
            action: item.action,
            type: item.type,
            time: new Date(item.time).toLocaleString(),
            avatar: item.user.slice(0, 2).toUpperCase(),
          })),
        )
        setPendingItems([
          { id: 1, type: "Candidate Review", count: data.pending.candidateReview || 0, priority: "high" },
          { id: 2, type: "Job Post Approval", count: data.pending.jobApproval || 0, priority: "medium" },
          { id: 3, type: "Referral Verification", count: data.pending.referralVerification || 0, priority: "high" },
          { id: 4, type: "User Reports", count: data.pending.userReports || 0, priority: "low" },
        ])
      })
      .catch(() => null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Last updated: Just now
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions from users</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Review</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.priority === "high" ? "bg-red-500" :
                      item.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`} />
                    <span className="text-sm font-medium text-foreground">{item.type}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              Review All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Edit Homepage</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Add User</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <span>Review Jobs</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span>Credit Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
