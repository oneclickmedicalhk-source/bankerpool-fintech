"use client"

import Link from "next/link"
import { 
  Users, 
  Eye, 
  Briefcase, 
  ArrowRight, 
  Shield, 
  Building2,
  UserCheck,
  MessageSquare,
  DollarSign,
  Search,
  FileText,
  Star,
  Lock,
  TrendingUp,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">BankerPool</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex">Hong Kong</Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Exclusive to Hong Kong Banking Professionals
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            The Private Liquidity Pool for Banking Talent.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty">
            Stop ghosting candidates. Turn your inactive talent pool into credits. 
            Access verified, high-intent banking professionals in Hong Kong.
          </p>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16 py-6 px-4 rounded-xl bg-muted/50">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">567</div>
              <div className="text-sm text-muted-foreground">Profiles Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">2,340+</div>
              <div className="text-sm text-muted-foreground">Verified Bankers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">Active Referrals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Culture Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Entry Points */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Choose Your Path
            </h2>
            <p className="text-muted-foreground">
              BankerPool serves three distinct communities. Select your role to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Recruiter Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">I&apos;m a Recruiter</CardTitle>
                <CardDescription>Looking for banking talent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Search className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Browse anonymous candidate profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Unlock contact details with credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Submit candidates to earn credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Manage your credit wallet</span>
                  </li>
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary/90" asChild>
                  <Link href="/recruiter">
                    Enter Talent Pool
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Candidate Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">I&apos;m a Candidate</CardTitle>
                <CardDescription>Looking for the inside scoop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Read anonymous culture reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Access salary benchmarks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Find referral opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Share your own reviews</span>
                  </li>
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary/90" asChild>
                  <Link href="/candidate">
                    Get Inside Scoop
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Banker Card */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="pb-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">I&apos;m a Banker</CardTitle>
                <CardDescription>Have a role, seeking referrals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Post referral opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Earn referral bonuses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Share culture reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Access insider intel</span>
                  </li>
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary/90" asChild>
                  <Link href="/banker">
                    Post Referral
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              How BankerPool Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A trusted ecosystem connecting recruiters, candidates, and banking professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Recruiters List Talent</h3>
              <p className="text-sm text-muted-foreground">
                Submit anonymized candidate profiles to the pool. Earn 50 credits when someone unlocks your candidate.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Bankers Share Intel</h3>
              <p className="text-sm text-muted-foreground">
                Verified bankers post culture reviews, salary data, and referral opportunities for their teams.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Candidates Get Matched</h3>
              <p className="text-sm text-muted-foreground">
                Job seekers access insider information and apply for referrals directly from hiring managers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Anonymous Until Unlocked</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-medium">HK Banking Focus</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Human-Vetted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">BankerPool</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The private talent exchange for Hong Kong banking professionals
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
