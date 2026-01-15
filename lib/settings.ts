import { promises as fs } from "fs"
import path from "path"

export interface IntegrationConfig {
  enabled: boolean
  url: string
  apiKey: string
}

export interface StorageConfig {
  moviesPath: string
  tvPath: string
}

export interface ServerConfig {
  transcodeQuality: "auto" | "1080p" | "720p" | "480p"
  maxConcurrentTranscodes: number
}

export interface Settings {
  sonarr: IntegrationConfig
  radarr: IntegrationConfig
  storage: StorageConfig
  server: ServerConfig
}

const defaultSettings: Settings = {
  sonarr: {
    enabled: false,
    url: "",
    apiKey: "",
  },
  radarr: {
    enabled: false,
    url: "",
    apiKey: "",
  },
  storage: {
    moviesPath: "/movies",
    tvPath: "/tv",
  },
  server: {
    transcodeQuality: "auto",
    maxConcurrentTranscodes: 4,
  },
}

const settingsPath = path.join(process.cwd(), "data", "settings.json")

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(settingsPath, "utf-8")
    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings,
      ...parsed,
      storage: {
        ...defaultSettings.storage,
        ...(parsed.storage || {}),
      },
      server: {
        ...defaultSettings.server,
        ...(parsed.server || {}),
      },
    }
  } catch {
    return defaultSettings
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const directory = path.dirname(settingsPath)
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), "utf-8")
}

export async function updateIntegration(
  name: keyof Settings,
  update: Partial<IntegrationConfig>,
): Promise<Settings> {
  const settings = await getSettings()
  const nextSettings = {
    ...settings,
    [name]: {
      ...settings[name],
      ...update,
    },
  }
  await saveSettings(nextSettings)
  return nextSettings
}

export async function updateSettings(update: Partial<Settings>): Promise<Settings> {
  const settings = await getSettings()
  const nextSettings: Settings = {
    ...settings,
    ...update,
    storage: {
      ...settings.storage,
      ...(update.storage || {}),
    },
    server: {
      ...settings.server,
      ...(update.server || {}),
    },
  }
  await saveSettings(nextSettings)
  return nextSettings
}
