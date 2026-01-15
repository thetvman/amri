"use client"

import { useEffect, useState } from "react"
import { MenuBar } from "@/components/menu-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Save, HardDrive, Server, Database, Plug, Download, RefreshCw } from "lucide-react"

interface IntegrationState {
  enabled: boolean
  url: string
  apiKey: string
  status?: string
  loading?: boolean
}

interface StorageState {
  moviesPath: string
  tvPath: string
}

interface ServerState {
  transcodeQuality: "auto" | "1080p" | "720p" | "480p"
  maxConcurrentTranscodes: number
}

export default function AdminSettings() {
  const [sonarr, setSonarr] = useState<IntegrationState>({
    enabled: false,
    url: "",
    apiKey: "",
  })
  const [radarr, setRadarr] = useState<IntegrationState>({
    enabled: false,
    url: "",
    apiKey: "",
  })
  const [storage, setStorage] = useState<StorageState>({
    moviesPath: "/movies",
    tvPath: "/tv",
  })
  const [server, setServer] = useState<ServerState>({
    transcodeQuality: "auto",
    maxConcurrentTranscodes: 4,
  })
  const [maintenanceStatus, setMaintenanceStatus] = useState<string>("")
  const [saveStatus, setSaveStatus] = useState<string>("")

  useEffect(() => {
    const loadSettings = async () => {
      const [sonarrRes, radarrRes, settingsRes] = await Promise.all([
        fetch("/api/integrations/sonarr").then((res) => res.json()),
        fetch("/api/integrations/radarr").then((res) => res.json()),
        fetch("/api/settings").then((res) => res.json()),
      ])
      setSonarr((prev) => ({ ...prev, ...sonarrRes }))
      setRadarr((prev) => ({ ...prev, ...radarrRes }))
      if (settingsRes.storage) {
        setStorage((prev) => ({ ...prev, ...settingsRes.storage }))
      }
      if (settingsRes.server) {
        setServer((prev) => ({ ...prev, ...settingsRes.server }))
      }
    }
    loadSettings()
  }, [])

  const saveIntegration = async (type: "sonarr" | "radarr") => {
    const data = type === "sonarr" ? sonarr : radarr
    const response = await fetch(`/api/integrations/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: data.url,
        apiKey: data.apiKey,
        enabled: data.enabled,
      }),
    })
    const result = await response.json()
    if (type === "sonarr") setSonarr((prev) => ({ ...prev, ...result, status: "Saved" }))
    if (type === "radarr") setRadarr((prev) => ({ ...prev, ...result, status: "Saved" }))
  }

  const testIntegration = async (type: "sonarr" | "radarr") => {
    if (type === "sonarr") setSonarr((prev) => ({ ...prev, loading: true, status: "Testing..." }))
    if (type === "radarr") setRadarr((prev) => ({ ...prev, loading: true, status: "Testing..." }))

    const data = type === "sonarr" ? sonarr : radarr
    const response = await fetch(`/api/integrations/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "test",
        url: data.url,
        apiKey: data.apiKey,
      }),
    })
    const result = await response.json()
    const status = result.ok ? "Connected" : result.error || "Failed"
    if (type === "sonarr") setSonarr((prev) => ({ ...prev, status, loading: false }))
    if (type === "radarr") setRadarr((prev) => ({ ...prev, status, loading: false }))
  }

  const downloadBackup = async () => {
    setMaintenanceStatus("Preparing backup...")
    const response = await fetch("/api/maintenance/backup")
    const data = await response.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `amrim-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setMaintenanceStatus("Backup downloaded")
  }

  const triggerUpdate = async () => {
    setMaintenanceStatus("Triggering update...")
    const response = await fetch("/api/maintenance/update", { method: "POST" })
    const data = await response.json()
    setMaintenanceStatus(data.message || "Update scheduled")
  }

  const handleSaveAll = async () => {
    setSaveStatus("Saving...")
    try {
      await Promise.all([
        fetch("/api/integrations/sonarr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: sonarr.url,
            apiKey: sonarr.apiKey,
            enabled: sonarr.enabled,
          }),
        }),
        fetch("/api/integrations/radarr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: radarr.url,
            apiKey: radarr.apiKey,
            enabled: radarr.enabled,
          }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storage,
            server,
          }),
        }),
      ])
      setSaveStatus("Saved")
    } catch (error: any) {
      setSaveStatus(error?.message || "Save failed")
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                amriM Admin
              </h1>
              <MenuBar isAdmin={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">System Settings</h2>
            <p className="text-muted-foreground">Configure your media server settings</p>
          </motion.div>

          <div className="space-y-6">
            {/* Integrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plug className="h-5 w-5" />
                    Integrations
                  </CardTitle>
                  <CardDescription>Connect to Sonarr and Radarr</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Sonarr (TV)</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sonarr-url">Base URL</Label>
                        <Input
                          id="sonarr-url"
                          placeholder="http://localhost:8989"
                          value={sonarr.url}
                          onChange={(event) => setSonarr((prev) => ({ ...prev, url: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sonarr-key">API Key</Label>
                        <Input
                          id="sonarr-key"
                          placeholder="Your Sonarr API key"
                          value={sonarr.apiKey}
                          onChange={(event) => setSonarr((prev) => ({ ...prev, apiKey: event.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="sonarr-enabled"
                        checked={sonarr.enabled}
                        onCheckedChange={(checked) => setSonarr((prev) => ({ ...prev, enabled: checked }))}
                      />
                      <Label htmlFor="sonarr-enabled">Enable Sonarr integration</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => testIntegration("sonarr")} disabled={sonarr.loading}>
                        Test connection
                      </Button>
                      <Button onClick={() => saveIntegration("sonarr")}>Save</Button>
                      {sonarr.status && <span className="text-sm text-muted-foreground">{sonarr.status}</span>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Radarr (Movies)</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="radarr-url">Base URL</Label>
                        <Input
                          id="radarr-url"
                          placeholder="http://localhost:7878"
                          value={radarr.url}
                          onChange={(event) => setRadarr((prev) => ({ ...prev, url: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="radarr-key">API Key</Label>
                        <Input
                          id="radarr-key"
                          placeholder="Your Radarr API key"
                          value={radarr.apiKey}
                          onChange={(event) => setRadarr((prev) => ({ ...prev, apiKey: event.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="radarr-enabled"
                        checked={radarr.enabled}
                        onCheckedChange={(checked) => setRadarr((prev) => ({ ...prev, enabled: checked }))}
                      />
                      <Label htmlFor="radarr-enabled">Enable Radarr integration</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" onClick={() => testIntegration("radarr")} disabled={radarr.loading}>
                        Test connection
                      </Button>
                      <Button onClick={() => saveIntegration("radarr")}>Save</Button>
                      {radarr.status && <span className="text-sm text-muted-foreground">{radarr.status}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Storage Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Settings
                  </CardTitle>
                  <CardDescription>Configure media library storage paths</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Movies Path</label>
                    <Input
                      type="text"
                      value={storage.moviesPath}
                      onChange={(event) => setStorage((prev) => ({ ...prev, moviesPath: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">TV Shows Path</label>
                    <Input
                      type="text"
                      value={storage.tvPath}
                      onChange={(event) => setStorage((prev) => ({ ...prev, tvPath: event.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Server Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Server Configuration
                  </CardTitle>
                  <CardDescription>Media server and transcoding settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Transcoding Quality</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-card/40 border border-border/40 text-foreground"
                      value={server.transcodeQuality}
                      onChange={(event) =>
                        setServer((prev) => ({
                          ...prev,
                          transcodeQuality: event.target.value as ServerState["transcodeQuality"],
                        }))
                      }
                    >
                      <option value="auto">Auto (Recommended)</option>
                      <option value="1080p">1080p</option>
                      <option value="720p">720p</option>
                      <option value="480p">480p</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Concurrent Transcodes</label>
                    <Input
                      type="number"
                      value={server.maxConcurrentTranscodes}
                      onChange={(event) =>
                        setServer((prev) => ({
                          ...prev,
                          maxConcurrentTranscodes: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Database Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database
                  </CardTitle>
                  <CardDescription>Database connection and backup settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Connection Status</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={downloadBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Maintenance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Maintenance
                  </CardTitle>
                  <CardDescription>Software updates and automated maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={triggerUpdate}>
                      Check for Updates
                    </Button>
                    {maintenanceStatus && (
                      <span className="text-sm text-muted-foreground">{maintenanceStatus}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end"
            >
              <div className="flex items-center gap-3">
                {saveStatus && <span className="text-sm text-muted-foreground">{saveStatus}</span>}
                <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handleSaveAll}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
