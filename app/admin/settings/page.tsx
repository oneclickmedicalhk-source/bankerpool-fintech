"use client"

import { useEffect, useState } from "react"
import { Globe, Bell, Shield, Mail, Key, Save, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_ENDPOINTS } from "@/lib/API/endpoints"

export default function SettingsPage() {
  const [settings, setSettings] = useState<any | null>(null)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [statusMessage, setStatusMessage] = useState("")

  /**
   * Load admin settings and masked API keys.
   */
  async function loadSettings() {
    const response = await fetch(API_ENDPOINTS.adminSettings)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to load settings.")
    }
    setSettings(data.settings)
    setApiKeys(data.apiKeys || [])
  }

  useEffect(() => {
    void loadSettings().catch((error) =>
      setStatusMessage(error instanceof Error ? error.message : "Failed to load settings."),
    )
  }, [])

  /**
   * Persist one settings section into backend.
   */
  async function saveSection(
    section: "general" | "notifications" | "security" | "api" | "email",
    data: Record<string, unknown>,
  ) {
    const response = await fetch(API_ENDPOINTS.adminSettings, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data }),
    })
    const payload = await response.json()
    if (!response.ok) {
      setStatusMessage(payload.error || `Failed to save ${section}.`)
      return
    }
    setStatusMessage(`${section} settings saved.`)
    await loadSettings()
  }

  /**
   * Rotate selected environment API key and show newly issued token once.
   */
  async function rotateKey(environment: "production" | "test") {
    const response = await fetch(API_ENDPOINTS.adminRotateApiKey(environment), { method: "POST" })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to rotate key.")
      return
    }
    setStatusMessage(`New ${environment} key: ${data.token}`)
    await loadSettings()
  }

  /**
   * Trigger SMTP test email using current configuration.
   */
  async function sendTestEmail() {
    const response = await fetch(API_ENDPOINTS.adminEmailTest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: settings.notifications.adminEmails?.[0] || "" }),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to send test email.")
      return
    }
    setStatusMessage("SMTP test email sent.")
  }

  /**
   * Trigger webhook test ping to configured webhook URL.
   */
  async function sendWebhookTest() {
    const response = await fetch(API_ENDPOINTS.adminWebhookTest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "admin.test" }),
    })
    const data = await response.json()
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to send webhook test.")
      return
    }
    setStatusMessage("Webhook test dispatched.")
  }

  if (!settings) {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage platform settings and integrations</p>
        </div>
      </div>

      {statusMessage ? <p className="text-sm text-primary">{statusMessage}</p> : null}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="general" className="gap-2"><Globe className="w-4 h-4" />General</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" />Security</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Key className="w-4 h-4" />API</TabsTrigger>
          <TabsTrigger value="email" className="gap-2"><Mail className="w-4 h-4" />Email</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input value={settings.general.siteName} onChange={(event) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, siteName: event.target.value } }))} />
                <Input value={settings.general.siteUrl} onChange={(event) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, siteUrl: event.target.value } }))} />
              </div>
              <Textarea value={settings.general.siteDescription} onChange={(event) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, siteDescription: event.target.value } }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select value={settings.general.defaultLanguage} onValueChange={(value) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, defaultLanguage: value } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh-hk">Traditional Chinese (HK)</SelectItem>
                    <SelectItem value="zh-cn">Simplified Chinese</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={settings.general.timezone} onValueChange={(value) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, timezone: value } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hkt">Hong Kong (HKT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input type="number" value={settings.general.creditsPerUnlock} onChange={(event) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, creditsPerUnlock: Number(event.target.value) } }))} />
                <Input type="number" value={settings.general.creditsEarnedPerUnlock} onChange={(event) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, creditsEarnedPerUnlock: Number(event.target.value) } }))} />
                <Input type="number" value={settings.general.newUserBonus} onChange={(event) => setSettings((prev: any) => ({ ...prev, general: { ...prev.general, newUserBonus: Number(event.target.value) } }))} />
              </div>
              <Button className="gap-2" onClick={() => void saveSection("general", settings.general)}><Save className="w-4 h-4" />Save General</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                ["newUserRegistration", "New User Registration"],
                ["newJobPost", "New Job Post"],
                ["newReferral", "New Referral"],
                ["profileUnlocks", "Profile Unlocks"],
                ["weeklyReports", "Weekly Reports"],
              ].map(([key, label]) => (
                <div className="flex items-center justify-between" key={key}>
                  <Label>{label}</Label>
                  <Switch checked={Boolean(settings.notifications[key])} onCheckedChange={(checked) => setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, [key]: checked } }))} />
                </div>
              ))}
              <Textarea value={(settings.notifications.adminEmails || []).join("\n")} onChange={(event) => setSettings((prev: any) => ({ ...prev, notifications: { ...prev.notifications, adminEmails: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) } }))} />
              <Button onClick={() => void saveSection("notifications", settings.notifications)}>Save Notifications</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Admin 2FA</Label><Switch checked={settings.security.requireAdminTwoFactor} onCheckedChange={(checked) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, requireAdminTwoFactor: checked } }))} /></div>
              <Input type="number" value={settings.security.sessionTimeoutMinutes} onChange={(event) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, sessionTimeoutMinutes: Number(event.target.value) } }))} />
              <Input type="number" value={settings.security.maxLoginAttempts} onChange={(event) => setSettings((prev: any) => ({ ...prev, security: { ...prev.security, maxLoginAttempts: Number(event.target.value) } }))} />
              <Button onClick={() => void saveSection("security", settings.security)}>Save Security</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Masked keys are shown below. Rotate to issue a new secret.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-4 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="font-medium">{key.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.maskedToken}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => void rotateKey(key.environment)}>
                    <RefreshCw className="w-4 h-4" /> Rotate
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Webhooks</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={settings.api.webhookUrl} onChange={(event) => setSettings((prev: any) => ({ ...prev, api: { ...prev.api, webhookUrl: event.target.value } }))} placeholder="https://your-server.com/webhook" />
              {Object.keys(settings.api.webhookEvents || {}).map((eventName) => (
                <div key={eventName} className="flex items-center justify-between">
                  <Label className="font-mono text-sm">{eventName}</Label>
                  <Switch checked={Boolean(settings.api.webhookEvents[eventName])} onCheckedChange={(checked) => setSettings((prev: any) => ({ ...prev, api: { ...prev.api, webhookEvents: { ...prev.api.webhookEvents, [eventName]: checked } } }))} />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Button onClick={() => void saveSection("api", settings.api)}>Save Webhooks</Button>
                <Button variant="outline" onClick={() => void sendWebhookTest()}>Send Test Webhook</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>SMTP Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input value={settings.email.smtpHost} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, smtpHost: event.target.value } }))} placeholder="SMTP Host" />
                <Input value={settings.email.smtpPort} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, smtpPort: Number(event.target.value) } }))} placeholder="SMTP Port" />
                <Input value={settings.email.smtpUsername} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, smtpUsername: event.target.value } }))} placeholder="SMTP Username" />
                <Input type="password" value={settings.email.smtpPassword} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, smtpPassword: event.target.value } }))} placeholder="SMTP Password" />
                <Input value={settings.email.fromName} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, fromName: event.target.value } }))} placeholder="From Name" />
                <Input value={settings.email.fromEmail} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, fromEmail: event.target.value } }))} placeholder="From Email" />
              </div>
              <Textarea value={settings.email.emailFooter} onChange={(event) => setSettings((prev: any) => ({ ...prev, email: { ...prev.email, emailFooter: event.target.value } }))} />
              <div className="flex items-center gap-2">
                <Button onClick={() => void saveSection("email", settings.email)}>Save Email Settings</Button>
                <Button variant="outline" onClick={() => void sendTestEmail()}>Send Test Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
