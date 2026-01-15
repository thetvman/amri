import { NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/lib/settings"

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  const body = await request.json()
  const settings = await updateSettings({
    storage: body.storage,
    server: body.server,
    transcoding: body.transcoding,
  })
  return NextResponse.json(settings)
}
