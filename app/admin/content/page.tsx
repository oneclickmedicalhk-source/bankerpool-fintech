"use client"

import { useEffect, useState } from "react"
import { FileText, Hash, Palette, Save, Eye, Undo, ChevronRight, Type } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

const sections = [
  { id: "hero", label: "Hero Section", icon: Type },
  { id: "stats", label: "Statistics", icon: Hash },
  { id: "cards", label: "Entry Cards", icon: FileText },
  { id: "footer", label: "Footer", icon: FileText },
]

export default function ContentManagement() {
  const [activeSection, setActiveSection] = useState("hero")
  const [hasChanges, setHasChanges] = useState(false)
  const [content, setContent] = useState<any | null>(null)
  const [status, setStatus] = useState("")

  /**
   * Load persisted content config from admin API.
   */
  async function loadContent() {
    const response = await fetch(API_ENDPOINTS.adminContent)
    const data = await response.json()
    setContent(data.content)
  }

  useEffect(() => {
    void loadContent().catch(() => setStatus("Failed to load content settings."))
  }, [])

  /**
   * Save current content edits to backend.
   */
  async function saveContent() {
    const response = await fetch(API_ENDPOINTS.adminContent, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    })
    if (!response.ok) {
      const data = await response.json()
      setStatus(data.error || "Failed to save content.")
      return
    }
    setHasChanges(false)
    setStatus("Content updated successfully.")
  }

  /**
   * Publish currently saved content revision.
   */
  async function publishContent() {
    const response = await fetch(API_ENDPOINTS.adminContentPublish, { method: "POST" })
    const data = await response.json()
    if (!response.ok) {
      setStatus(data.error || "Failed to publish content.")
      return
    }
    setStatus("Content published.")
  }

  /**
   * Reset unsaved local changes by reloading latest server state.
   */
  async function discardChanges() {
    await loadContent()
    setHasChanges(false)
    setStatus("Unsaved changes discarded.")
  }

  if (!content) {
    return <p className="text-sm text-muted-foreground">Loading content settings...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Edit your website content, text, and visuals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void publishContent()}>
            <Eye className="w-4 h-4" />
            Publish
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled={!hasChanges} onClick={() => void discardChanges()}>
            <Undo className="w-4 h-4" />
            Discard
          </Button>
          <Button size="sm" className="gap-2" disabled={!hasChanges} onClick={() => void saveContent()}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {status ? <p className="text-sm text-primary">{status}</p> : null}

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
            <CardDescription>Select a section to edit</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <section.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{section.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === "hero" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Hero Section
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input
                    value={content.hero.badge}
                    onChange={(event) => {
                      setHasChanges(true)
                      setContent((prev: any) => ({ ...prev, hero: { ...prev.hero, badge: event.target.value } }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Textarea
                    value={content.hero.headline}
                    onChange={(event) => {
                      setHasChanges(true)
                      setContent((prev: any) => ({ ...prev, hero: { ...prev.hero, headline: event.target.value } }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Textarea
                    value={content.hero.subheadline}
                    onChange={(event) => {
                      setHasChanges(true)
                      setContent((prev: any) => ({ ...prev, hero: { ...prev.hero, subheadline: event.target.value } }))
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Badge</Label>
                  <Switch
                    checked={content.hero.showBadge}
                    onCheckedChange={(checked) => {
                      setHasChanges(true)
                      setContent((prev: any) => ({ ...prev, hero: { ...prev.hero, showBadge: checked } }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeSection === "stats" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.stats.map((stat: any, index: number) => (
                  <div key={stat.id} className="grid grid-cols-2 gap-3">
                    <Input
                      value={stat.value}
                      onChange={(event) => {
                        setHasChanges(true)
                        setContent((prev: any) => ({
                          ...prev,
                          stats: prev.stats.map((item: any, itemIndex: number) =>
                            itemIndex === index ? { ...item, value: event.target.value } : item,
                          ),
                        }))
                      }}
                    />
                    <Input
                      value={stat.label}
                      onChange={(event) => {
                        setHasChanges(true)
                        setContent((prev: any) => ({
                          ...prev,
                          stats: prev.stats.map((item: any, itemIndex: number) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item,
                          ),
                        }))
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {activeSection === "cards" ? (
            <Card>
              <CardHeader>
                <CardTitle>Entry Point Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recruiter">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
                    <TabsTrigger value="candidate">Candidate</TabsTrigger>
                    <TabsTrigger value="banker">Banker</TabsTrigger>
                  </TabsList>
                  {(["recruiter", "candidate", "banker"] as const).map((role) => (
                    <TabsContent value={role} key={role} className="space-y-3 mt-4">
                      <Input
                        value={content.cards[role].title}
                        onChange={(event) => {
                          setHasChanges(true)
                          setContent((prev: any) => ({
                            ...prev,
                            cards: { ...prev.cards, [role]: { ...prev.cards[role], title: event.target.value } },
                          }))
                        }}
                      />
                      <Input
                        value={content.cards[role].description}
                        onChange={(event) => {
                          setHasChanges(true)
                          setContent((prev: any) => ({
                            ...prev,
                            cards: { ...prev.cards, [role]: { ...prev.cards[role], description: event.target.value } },
                          }))
                        }}
                      />
                      <Input
                        value={content.cards[role].buttonText}
                        onChange={(event) => {
                          setHasChanges(true)
                          setContent((prev: any) => ({
                            ...prev,
                            cards: { ...prev.cards, [role]: { ...prev.cards[role], buttonText: event.target.value } },
                          }))
                        }}
                      />
                      <Textarea
                        rows={4}
                        value={content.cards[role].features.join("\n")}
                        onChange={(event) => {
                          setHasChanges(true)
                          setContent((prev: any) => ({
                            ...prev,
                            cards: {
                              ...prev.cards,
                              [role]: { ...prev.cards[role], features: event.target.value.split("\n").filter(Boolean) },
                            },
                          }))
                        }}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : null}

          {activeSection === "footer" ? (
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={content.footer.tagline}
                  onChange={(event) => {
                    setHasChanges(true)
                    setContent((prev: any) => ({ ...prev, footer: { ...prev.footer, tagline: event.target.value } }))
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  {(["terms", "privacy", "contact"] as const).map((key) => (
                    <Input
                      key={key}
                      value={content.footer.links[key]}
                      onChange={(event) => {
                        setHasChanges(true)
                        setContent((prev: any) => ({
                          ...prev,
                          footer: { ...prev.footer, links: { ...prev.footer.links, [key]: event.target.value } },
                        }))
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Region Badge</Label>
                  <Switch
                    checked={content.footer.showRegionBadge}
                    onCheckedChange={(checked) => {
                      setHasChanges(true)
                      setContent((prev: any) => ({ ...prev, footer: { ...prev.footer, showRegionBadge: checked } }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input
                value={content.theme.primaryColor}
                onChange={(event) => {
                  setHasChanges(true)
                  setContent((prev: any) => ({ ...prev, theme: { ...prev.theme, primaryColor: event.target.value } }))
                }}
              />
              <Select
                value={content.theme.backgroundStyle}
                onValueChange={(value) => {
                  setHasChanges(true)
                  setContent((prev: any) => ({ ...prev, theme: { ...prev.theme, backgroundStyle: value } }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
