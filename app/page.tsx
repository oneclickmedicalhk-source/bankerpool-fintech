 
import { cache } from "react"
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
import { getDb } from "@/lib/API/mongodb"
import { COLLECTIONS } from "@/lib/model/collections"
import type { AdminContentConfig } from "@/lib/model/types"

const getAdminContent = cache(async () => {
  try {
    const db = await getDb()
    const content = await db.collection<AdminContentConfig>(COLLECTIONS.adminContent).findOne({})
    return content
  } catch (_error) {
    return null
  }
})

export default async function LandingPage() {
  const content = await getAdminContent()
  const hero = content?.hero
  const stats = content?.stats || []
  const cards = content?.cards
  const footer = content?.footer

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] via-background to-background">
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
      <section className="py-16 md:py-24 px-4 bg-[#f3ecdf]/80 border-y border-[#e7dcc8]">
        <div className="container mx-auto text-center max-w-4xl">
          {hero?.showBadge ? (
            <Badge variant="secondary" className="mb-6">
              {hero.badge}
            </Badge>
          ) : null}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            {hero?.headline || "The Private Liquidity Pool for Banking Talent."}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty">
            {hero?.subheadline ||
              "Stop ghosting candidates. Turn your inactive talent pool into credits. Access verified, high-intent banking professionals in Hong Kong."}
          </p>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16 py-6 px-4 rounded-xl bg-white/80 border border-[#e7dcc8] shadow-sm">
            {(stats.length > 0
              ? stats
              : [
                  { value: "567", label: "Profiles Unlocked" },
                  { value: "2,340+", label: "Verified Bankers" },
                  { value: "89", label: "Active Referrals" },
                  { value: "156", label: "Culture Reviews" },
                ]
            ).map((stat, index) => (
              <div className="text-center" key={index}>
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Entry Points */}
      <section className="py-12 px-4 bg-[#faf6ee]">
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
                <CardTitle className="text-xl">{cards?.recruiter?.title || "I&apos;m a Recruiter"}</CardTitle>
                <CardDescription>{cards?.recruiter?.description || "Looking for banking talent"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  {(cards?.recruiter?.features || [
                    "Browse anonymous candidate profiles",
                    "Unlock contact details with credits",
                    "Submit candidates to earn credits",
                    "Manage your credit wallet",
                  ]).map((feature, index) => (
                    <li className="flex items-start gap-2" key={index}>
                      <Search className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary/90" asChild>
                  <Link href="/recruiter">
                    {cards?.recruiter?.buttonText || "Enter Talent Pool"}
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
                <CardTitle className="text-xl">{cards?.candidate?.title || "I&apos;m a Candidate"}</CardTitle>
                <CardDescription>{cards?.candidate?.description || "Looking for the inside scoop"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  {(cards?.candidate?.features || [
                    "Read anonymous culture reviews",
                    "Access salary benchmarks",
                    "Find referral opportunities",
                    "Share your own reviews",
                  ]).map((feature, index) => (
                    <li className="flex items-start gap-2" key={index}>
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary/90" asChild>
                  <Link href="/candidate">
                    {cards?.candidate?.buttonText || "Get Inside Scoop"}
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
                <CardTitle className="text-xl">{cards?.banker?.title || "I&apos;m a Banker"}</CardTitle>
                <CardDescription>{cards?.banker?.description || "Have a role, seeking referrals"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  {(cards?.banker?.features || [
                    "Post referral opportunities",
                    "Earn referral bonuses",
                    "Share culture reviews",
                    "Access insider intel",
                  ]).map((feature, index) => (
                    <li className="flex items-start gap-2" key={index}>
                      <UserCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4 group-hover:bg-primary/90" asChild>
                  <Link href="/banker">
                    {cards?.banker?.buttonText || "Post Referral"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 bg-background">
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
      <section className="py-12 px-4 bg-[#f8f2e8]">
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
              {footer?.tagline || "The private talent exchange for Hong Kong banking professionals"}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href={footer?.links?.terms || "/terms"} className="hover:text-foreground transition-colors">Terms</Link>
              <Link href={footer?.links?.privacy || "/privacy"} className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href={footer?.links?.contact || "/contact"} className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
