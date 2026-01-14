import { NextResponse } from "next/server"
import { getSettings } from "@/lib/settings"
import { getLibrary } from "@/lib/library"

export async function GET() {
  const [settings, library] = await Promise.all([getSettings(), getLibrary()])
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    settings,
    library,
  })
}
