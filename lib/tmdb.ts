const TMDB_API_BASE = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280"

export interface MediaItem {
  id: string
  title: string
  year?: number
  rating: string
  genre: string
  poster: string
  type: "movie" | "tv"
  source?: "library"
}

export interface MediaDetails {
  id: string
  title: string
  year?: number
  rating: string
  description: string
  genre: string
  poster: string
  backdrop: string
  duration: string
  quality: string
  type: "movie" | "tv"
}

interface TmdbGenre {
  id: number
  name: string
}

interface TmdbMedia {
  id: number
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  genre_ids?: number[]
  poster_path?: string | null
}

interface TmdbDetailsBase {
  id: number
  genres?: TmdbGenre[]
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  vote_average?: number
}

interface TmdbMovieDetails extends TmdbDetailsBase {
  title?: string
  release_date?: string
  runtime?: number
}

interface TmdbTvDetails extends TmdbDetailsBase {
  name?: string
  first_air_date?: string
  episode_run_time?: number[]
}

function getApiKey() {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured")
  }
  return apiKey
}

async function fetchFromTMDB<T>(path: string): Promise<T> {
  const apiKey = getApiKey()
  const url = `${TMDB_API_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${apiKey}`
  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`)
  }
  return response.json()
}

async function getGenreMap(type: "movie" | "tv") {
  const data = await fetchFromTMDB<{ genres: TmdbGenre[] }>(`/genre/${type}/list`)
  return new Map<number, string>(data.genres.map((genre) => [genre.id, genre.name]))
}

function formatRating(value?: number) {
  if (!value) return "N/A"
  return value.toFixed(1)
}

function getYear(value?: string) {
  if (!value) return undefined
  const year = Number(value.split("-")[0])
  return Number.isNaN(year) ? undefined : year
}

function getPoster(path?: string | null) {
  if (!path) return "/placeholder.svg"
  return `${TMDB_IMAGE_BASE}${path}`
}

function getBackdrop(path?: string | null) {
  if (!path) return "/placeholder.svg"
  return `${TMDB_BACKDROP_BASE}${path}`
}

function mapMedia(item: TmdbMedia, type: "movie" | "tv", genreMap: Map<number, string>): MediaItem {
  const title = type === "movie" ? item.title || "Untitled" : item.name || "Untitled"
  const date = type === "movie" ? item.release_date : item.first_air_date
  const genres = (item.genre_ids || [])
    .map((id) => genreMap.get(id))
    .filter(Boolean)
    .slice(0, 2)
    .join(", ")

  return {
    id: String(item.id),
    title,
    year: getYear(date),
    rating: formatRating(item.vote_average),
    genre: genres || "Drama",
    poster: getPoster(item.poster_path),
    type,
  }
}

export async function getTrendingMovies(): Promise<MediaItem[]> {
  const [genres, data] = await Promise.all([
    getGenreMap("movie"),
    fetchFromTMDB<{ results: TmdbMedia[] }>("/trending/movie/week"),
  ])
  return data.results.map((item) => mapMedia(item, "movie", genres))
}

export async function getTrendingTV(): Promise<MediaItem[]> {
  const [genres, data] = await Promise.all([
    getGenreMap("tv"),
    fetchFromTMDB<{ results: TmdbMedia[] }>("/trending/tv/week"),
  ])
  return data.results.map((item) => mapMedia(item, "tv", genres))
}

export async function getTrendingMedia(): Promise<MediaItem[]> {
  const [movies, tv] = await Promise.all([getTrendingMovies(), getTrendingTV()])
  return [...movies, ...tv]
}

function formatDuration(minutes?: number) {
  if (!minutes) return "N/A"
  return `${minutes} min`
}

function formatGenres(genres?: TmdbGenre[]) {
  if (!genres || genres.length === 0) return "Drama"
  return genres.slice(0, 2).map((genre) => genre.name).join(", ")
}

async function fetchDetails<T>(path: string): Promise<T | null> {
  const apiKey = getApiKey()
  const url = `${TMDB_API_BASE}${path}?api_key=${apiKey}`
  const response = await fetch(url, { next: { revalidate: 3600 } })
  if (!response.ok) return null
  return response.json()
}

export async function getMediaDetails(
  id: string,
  type?: "movie" | "tv",
): Promise<MediaDetails | null> {
  if (type === "movie") {
    const movie = await fetchDetails<TmdbMovieDetails>(`/movie/${id}`)
    if (!movie) return null
    return {
      id: String(movie.id),
      title: movie.title || "Untitled",
      year: getYear(movie.release_date),
      rating: formatRating(movie.vote_average),
      description: movie.overview || "No description available.",
      genre: formatGenres(movie.genres),
      poster: getPoster(movie.poster_path),
      backdrop: getBackdrop(movie.backdrop_path),
      duration: formatDuration(movie.runtime),
      quality: "4K",
      type: "movie",
    }
  }

  if (type === "tv") {
    const tv = await fetchDetails<TmdbTvDetails>(`/tv/${id}`)
    if (!tv) return null
    return {
      id: String(tv.id),
      title: tv.name || "Untitled",
      year: getYear(tv.first_air_date),
      rating: formatRating(tv.vote_average),
      description: tv.overview || "No description available.",
      genre: formatGenres(tv.genres),
      poster: getPoster(tv.poster_path),
      backdrop: getBackdrop(tv.backdrop_path),
      duration: formatDuration(tv.episode_run_time?.[0]),
      quality: "4K",
      type: "tv",
    }
  }

  const movie = await fetchDetails<TmdbMovieDetails>(`/movie/${id}`)
  if (movie) {
    return {
      id: String(movie.id),
      title: movie.title || "Untitled",
      year: getYear(movie.release_date),
      rating: formatRating(movie.vote_average),
      description: movie.overview || "No description available.",
      genre: formatGenres(movie.genres),
      poster: getPoster(movie.poster_path),
      backdrop: getBackdrop(movie.backdrop_path),
      duration: formatDuration(movie.runtime),
      quality: "4K",
      type: "movie",
    }
  }

  const tv = await fetchDetails<TmdbTvDetails>(`/tv/${id}`)
  if (tv) {
    return {
      id: String(tv.id),
      title: tv.name || "Untitled",
      year: getYear(tv.first_air_date),
      rating: formatRating(tv.vote_average),
      description: tv.overview || "No description available.",
      genre: formatGenres(tv.genres),
      poster: getPoster(tv.poster_path),
      backdrop: getBackdrop(tv.backdrop_path),
      duration: formatDuration(tv.episode_run_time?.[0]),
      quality: "4K",
      type: "tv",
    }
  }

  return null
}
