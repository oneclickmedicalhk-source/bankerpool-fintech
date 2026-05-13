"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, MoreHorizontal, UserPlus, Mail, Ban, Download, CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [counts, setCounts] = useState({ total: 0, active: 0, pending: 0, suspended: 0 })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [statusMessage, setStatusMessage] = useState("")
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "candidate",
    initialCredits: 100,
    password: "Password123!",
  })

  /**
   * Query admin users list and current status counters.
   */
  async function loadUsers() {
    const params = new URLSearchParams({
      query: searchQuery,
      role: roleFilter,
      status: statusFilter,
    })
    const response = await fetch(`${API_ENDPOINTS.adminUsers}?${params.toString()}`)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to load users.")
    }
    setUsers(data.users)
    setCounts(data.counts)
  }

  useEffect(() => {
    void loadUsers().catch((error) => setStatusMessage(error instanceof Error ? error.message : "Failed to load users."))
  }, [searchQuery, roleFilter, statusFilter])

  /**
   * Create user from admin modal and refresh table.
   */
  async function createUser() {
    const response = await fetch(API_ENDPOINTS.adminUsers, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to create user.")
      return
    }
    setStatusMessage("User created.")
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      role: "candidate",
      initialCredits: 100,
      password: "Password123!",
    })
    await loadUsers()
  }

  /**
   * Update one user status/action from row dropdown operations.
   */
  async function updateUser(id: string, updates: Record<string, unknown>) {
    const response = await fetch(API_ENDPOINTS.adminUserById(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to update user.")
      return
    }
    await loadUsers()
  }

  /**
   * Remove one user account from platform.
   */
  async function deleteUser(id: string) {
    const response = await fetch(API_ENDPOINTS.adminUserById(id), { method: "DELETE" })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to delete user.")
      return
    }
    setStatusMessage("User deleted.")
    await loadUsers()
  }

  /**
   * Bulk suspend currently selected users.
   */
  async function suspendSelected() {
    const response = await fetch(API_ENDPOINTS.adminBulkSuspend, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: selectedUsers }),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to suspend selected users.")
      return
    }
    setSelectedUsers([])
    setStatusMessage("Selected users suspended.")
    await loadUsers()
  }

  /**
   * Trigger backend export download for users CSV.
   */
  function exportUsers() {
    window.open(API_ENDPOINTS.adminAnalyticsExport("users"), "_blank")
  }

  const selectAllChecked = useMemo(
    () => users.length > 0 && selectedUsers.length === users.length,
    [users.length, selectedUsers.length],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage all registered users and their permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportUsers}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account manually</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={newUser.firstName}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, firstName: event.target.value }))}
                  />
                  <Input
                    placeholder="Last Name"
                    value={newUser.lastName}
                    onChange={(event) => setNewUser((prev) => ({ ...prev, lastName: event.target.value }))}
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Temporary Password"
                  value={newUser.password}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                />
                <Select value={newUser.role} onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="banker">Banker</SelectItem>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={newUser.initialCredits}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, initialCredits: Number(event.target.value) }))}
                />
              </div>
              <DialogFooter>
                <Button onClick={() => void createUser()}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-primary">{statusMessage}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.total}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.active}</p><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.pending}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{counts.suspended}</p><p className="text-sm text-muted-foreground">Suspended</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{users.length} users found</CardDescription>
            </div>
            {selectedUsers.length > 0 ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => void suspendSelected()}>
                  <Ban className="w-4 h-4" /> Suspend Selected
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                  void fetch(API_ENDPOINTS.adminBulkEmail, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userIds: selectedUsers, subject: "BankerPool notice", body: "Admin message" }),
                  }).then(() => setStatusMessage("Bulk email request logged."))
                }}>
                  <Mail className="w-4 h-4" /> Email Selected
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search users..." />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="banker">Banker</SelectItem>
                <SelectItem value="candidate">Candidate</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left">
                    <Checkbox
                      checked={selectAllChecked}
                      onCheckedChange={(checked) => setSelectedUsers(checked ? users.map((item) => item.id) : [])}
                    />
                  </th>
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Role</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Credits</th>
                  <th className="text-right py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border">
                    <td className="py-2 px-2">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) =>
                          setSelectedUsers((prev) =>
                            checked ? [...prev, user.id] : prev.filter((item) => item !== user.id),
                          )
                        }
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8"><AvatarFallback>{user.avatar}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2"><Badge variant="secondary">{user.role}</Badge></td>
                    <td className="py-2 px-2">
                      <span className="text-sm flex items-center gap-1">
                        {user.status === "active" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : null}
                        {user.status === "pending" ? <Clock className="w-4 h-4 text-yellow-600" /> : null}
                        {user.status === "suspended" ? <XCircle className="w-4 h-4 text-red-600" /> : null}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-2 px-2">{user.credits}</td>
                    <td className="py-2 px-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => void updateUser(user.id, { status: user.status === "suspended" ? "active" : "suspended" })}>
                            {user.status === "suspended" ? "Reactivate" : "Suspend"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => void updateUser(user.id, { role: "admin" })}>Make Admin</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => void deleteUser(user.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
