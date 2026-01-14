import { NextResponse } from "next/server"
import { getSettings, updateIntegration } from "@/lib/settings"

async function testConnection(url: string, apiKey: string) {
  const response = await fetch(`${url}/api/v3/system/status`, {
    headers: {
      "X-Api-Key": apiKey,
    },
  })
  if (!response.ok) {
    throw new Error(`Radarr connection failed: ${response.status}`)
  }
  return response.json()
}

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings.radarr)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, url, apiKey, enabled } = body

  if (action === "test") {
    try {
      const result = await testConnection(url, apiKey)
      return NextResponse.json({ ok: true, result })
    } catch (error: any) {
      return NextResponse.json({ ok: false, error: error.message || "Test failed" }, { status: 400 })
    }
  }

  const settings = await updateIntegration("radarr", {
    url: url ?? "",
    apiKey: apiKey ?? "",
    enabled: Boolean(enabled),
  })

  return NextResponse.json(settings.radarr)
}
