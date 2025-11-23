"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"

export const listRegions = async () => {
  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.size > 0 && regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions || regions.length === 0) {
      console.error("No regions available in the store")
      return null
    }

    regionMap.clear() // Clear to avoid stale data

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c?.iso_2) {
          regionMap.set(c.iso_2, region)
        }
      })
    })

    let selectedRegion: HttpTypes.StoreRegion | undefined = undefined

    if (countryCode && regionMap.has(countryCode)) {
      selectedRegion = regionMap.get(countryCode)
    } else {
      selectedRegion = regions[0] // Fallback to first region
      console.warn(`No region found for countryCode: ${countryCode}, using default: ${selectedRegion.id}`)
    }

    return selectedRegion
  } catch (e: any) {
    console.error("Error fetching region:", e.message)
    return null
  }
}