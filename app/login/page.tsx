"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_ENDPOINTS } from "@/lib/API/endpoints"
import {
  Waves,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regName, setRegName] = useState("")
  const [regRole, setRegRole] = useState<"recruiter" | "candidate" | "banker">("recruiter")
  const [regBank, setRegBank] = useState("")

  /**
   * Navigate the user to their role-specific dashboard after auth success.
   */
  function routeByRole(role: "recruiter" | "candidate" | "banker" | "admin") {
    if (role === "admin") {
      router.push("/admin")
      return
    }
    if (role === "recruiter") {
      router.push("/recruiter")
      return
    }
    if (role === "candidate") {
      router.push("/candidate")
      return
    }
    router.push("/banker")
  }

  /**
   * Submit login form to server and start an authenticated session.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await fetch(API_ENDPOINTS.authLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Login failed.")
      }
      routeByRole(data.user.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register a new account with selected role and auto-login via session cookie.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await fetch(API_ENDPOINTS.authRegister, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          role: regRole,
          name: regName,
          bank: regBank,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.")
      }

      // Keep signup and login as separate steps for clearer onboarding.
      setRegPassword("")
      setPassword("")
      setEmail(regEmail)
      setActiveTab("email")
      setSuccessMessage("註冊成功，請用剛才嘅電郵同密碼登入。")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-20">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Waves className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-semibold text-foreground">BankerPool</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">
              Sign in to access the talent pool
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10 bg-input border-border"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-input border-border"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      {isLoading ? "Signing in..." : (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        placeholder="Your name"
                        value={regName}
                        onChange={(event) => setRegName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@company.com"
                        value={regEmail}
                        onChange={(event) => setRegEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={regPassword}
                        onChange={(event) => setRegPassword(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-role">Role</Label>
                      <select
                        id="reg-role"
                        className="w-full rounded-md border border-border bg-background p-2 text-sm"
                        value={regRole}
                        onChange={(event) =>
                          setRegRole(event.target.value as "recruiter" | "candidate" | "banker")
                        }
                      >
                        <option value="recruiter">Recruiter</option>
                        <option value="candidate">Candidate</option>
                        <option value="banker">Banker</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-bank">Bank / Company (optional)</Label>
                      <Input
                        id="reg-bank"
                        placeholder="e.g. HSBC, Morgan Stanley"
                        value={regBank}
                        onChange={(event) => setRegBank(event.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>

              </Tabs>

              {successMessage ? (
                <p className="mt-4 text-sm text-primary">{successMessage}</p>
              ) : null}

              {error ? (
                <p className="mt-4 text-sm text-destructive">{error}</p>
              ) : null}

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    Register in this page
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-xs text-muted-foreground text-center">
              Trusted by 200+ recruiters across Hong Kong
            </p>
            <div className="flex items-center gap-6 text-muted-foreground/60">
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>PDPO Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
