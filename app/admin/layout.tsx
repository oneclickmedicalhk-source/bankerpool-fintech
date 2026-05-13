"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
  Search,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/content", icon: FileText, label: "Content Management" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/jobs", icon: Briefcase, label: "Job Posts" },
  { href: "/admin/referrals", icon: UserCheck, label: "Referrals" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

function SidebarContent({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  return (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-6 border-b border-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold text-foreground">BankerPool</span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-border",
        collapsed && "p-2"
      )}>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Exit Admin</span>}
        </Link>
      </div>
    </>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [adminName, setAdminName] = useState("Admin User")
  const [adminEmail, setAdminEmail] = useState("admin@bankerpool.com")
  const pathname = usePathname()

  /**
   * Load admin account identity for header display.
   */
  useEffect(() => {
    void fetch(API_ENDPOINTS.authMe)
      .then((response) => response.json())
      .then((data) => {
        if (data?.user?.name) {
          setAdminName(data.user.name)
        }
        if (data?.user?.email) {
          setAdminEmail(data.user.email)
        }
      })
      .catch(() => null)
  }, [])

  /**
   * Clear cookie session and return to login.
   */
  async function logout() {
    await fetch(API_ENDPOINTS.authLogout, { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 hidden md:flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} />
        
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            collapsed && "rotate-180"
          )} />
        </button>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Admin navigation menu</SheetDescription>
                <div className="flex flex-col h-full">
                  <SidebarContent collapsed={false} pathname={pathname} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">AD</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{adminName}</p>
                      <p className="text-xs text-muted-foreground">{adminEmail}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => void logout()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
