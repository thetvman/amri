import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Update pipeline queued. Server update will be enabled in production.",
  })
}
