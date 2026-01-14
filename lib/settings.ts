import { promises as fs } from "fs"
import path from "path"

export interface IntegrationConfig {
  enabled: boolean
  url: string
  apiKey: string
}

export interface Settings {
  sonarr: IntegrationConfig
  radarr: IntegrationConfig
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
}

const settingsPath = path.join(process.cwd(), "data", "settings.json")

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(settingsPath, "utf-8")
    return { ...defaultSettings, ...JSON.parse(raw) }
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
