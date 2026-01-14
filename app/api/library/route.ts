import { NextResponse } from "next/server"
import { getLibrary } from "@/lib/library"

export async function GET() {
  const library = await getLibrary()
  return NextResponse.json(library)
}
