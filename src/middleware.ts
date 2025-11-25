// src/middleware.ts
import { NextRequest, NextResponse } from "next/server"
import type { HttpTypes } from "@medusajs/types"

// ──────────────────────────────────────────────────────────────
// Environment variables (must be set in Vercel!)
// ──────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase() || "us"

// ──────────────────────────────────────────────────────────────
// In-memory cache for regions (shared across invocations)
// ──────────────────────────────────────────────────────────────
const regionMapCache = {
  map: new Map<string, HttpTypes.StoreRegion>(),
  updatedAt: 0,
}

// ──────────────────────────────────────────────────────────────
// Fetch and cache regions from Medusa
// ──────────────────────────────────────────────────────────────
async function getRegionMap(): Promise<Map<string, HttpTypes.StoreRegion>> {
  // Revalidate every hour
  if (regionMapCache.updatedAt > Date.now() - 3_600_000 && regionMapCache.map.size > 0) {
    return regionMapCache.map
  }

  if (!BACKEND_URL || !PUBLISHABLE_KEY) {
    console.error("Missing MEDUSA_BACKEND_URL or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
    return regionMapCache.map
  }

  try {
    const res = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 3600, tags: ["regions"] },
    })

    if (!res.ok) throw new Error("Failed to fetch regions")

    const { regions }: { regions: HttpTypes.StoreRegion[] } = await res.json()

    if (!regions?.length) {
      console.warn("No regions configured in Medusa")
      return regionMapCache.map
    }

    const newMap = new Map<string, HttpTypes.StoreRegion>()
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c.iso_2) newMap.set(c.iso_2.toLowerCase(), region)
      })
    })

    regionMapCache.map = newMap
    regionMapCache.updatedAt = Date.now()
    return newMap
  } catch (err) {
    console.error("Error loading regions:", err)
    return regionMapCache.map
  }
}

// ──────────────────────────────────────────────────────────────
// Main middleware
// ──────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const origin = request.nextUrl.origin

  // Skip static files, API routes, Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  const regionMap = await getRegionMap()
  const pathCountry = pathname.split("/")[1]?.toLowerCase() || ""
  const hasValidCountryCode = regionMap.has(pathCountry)

  // If already on a valid country path → just continue
  if (hasValidCountryCode) {
    return NextResponse.next()
  }

  // Detect country from Vercel header or fallback
  let countryCode: string | undefined
  const vercelCountry = request.headers.get("x-vercel-ip-country")?.toLowerCase()

  if (vercelCountry && regionMap.has(vercelCountry)) {
    countryCode = vercelCountry
  } else if (regionMap.has(DEFAULT_REGION)) {
    countryCode = DEFAULT_REGION
  } else if (regionMap.size > 0) {
    countryCode = regionMap.keys().next().value // first available
  }

  // If we found a country → redirect once and only once
  if (countryCode) {
    const newPath = pathname === "/" ? "" : pathname
    const newUrl = `${origin}/${countryCode}${newPath}${request.nextUrl.search}`
    return NextResponse.redirect(newUrl, 307)
  }

  // Fallback: just let it pass (no infinite loop)
  return NextResponse.next()
}

// ──────────────────────────────────────────────────────────────
// Matcher – only run on relevant paths
// ──────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Run on all paths except:
     * - API routes
     * - Next.js internals
     * - Static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}