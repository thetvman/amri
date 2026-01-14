import { promises as fs } from "fs"
import path from "path"

export interface LibraryItem {
  id: string
  title: string
  type: "movie" | "tv"
  year?: number
  quality?: string
  size?: string
  poster?: string
  status?: string
}

export interface LibraryData {
  movies: LibraryItem[]
  tv: LibraryItem[]
  updatedAt: string
}

const libraryPath = path.join(process.cwd(), "data", "library.json")

export async function getLibrary(): Promise<LibraryData> {
  try {
    const raw = await fs.readFile(libraryPath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return { movies: [], tv: [], updatedAt: new Date().toISOString() }
  }
}

export async function saveLibrary(data: LibraryData): Promise<void> {
  const directory = path.dirname(libraryPath)
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(libraryPath, JSON.stringify(data, null, 2), "utf-8")
}
