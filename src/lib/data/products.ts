"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

/**
 * Fetches paginated products directly from the Medusa backend.
 * Caching has been completely disabled — this always fetches fresh data.
 */
export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const currentPage = Math.max(pageParam, 1)
  const offset = currentPage === 1 ? 0 : (currentPage - 1) * limit

  // Determine region
  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const { products, count } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
    count: number
  }>("/store/products", {
    method: "GET",
    query: {
      limit,
      offset,
      region_id: region.id,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
      ...queryParams,
    },
    headers,
    cache: "no-store",
  })

  const nextPage = count > offset + limit ? currentPage + 1 : null

  return {
    response: { products, count },
    nextPage,
    queryParams,
  }
}

/**
 * Fetches and sorts products without using cache.
 * Gets up to 100 products, sorts them, and paginates locally.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}) => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: { ...queryParams, limit: 100 },
    countryCode,
  })

  const mapSortOption = (option: string) => {
    switch (option) {
      case "price_low_to_high":
        return "price_asc"
      case "price_high_to_low":
        return "price_desc"
      case "latest":
        return "created_at"
      default:
        return "created_at"
    }
  }

  const mappedSortBy = mapSortOption(sortBy)

  const sortedProducts = sortProducts(products, mappedSortBy) || []

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

  const nextPage = count > endIndex ? page + 1 : null

  return {
    response: { products: paginatedProducts, count },
    nextPage,
    queryParams,
  }
}

/**
 * Search products inside a single category — no cache, always fresh.
 */
export const searchProductsInCategory = async ({
  categoryId,
  childCategoryIds = [],
  query,
  countryCode,
}: {
  categoryId: string
  childCategoryIds?: string[]
  query: string
  countryCode: string
}) => {
  const region = await getRegion(countryCode)
  if (!region) return []

  // Combine parent + children
  const categoryIds = [categoryId, ...childCategoryIds]

  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
  }>("/store/products", {
    method: "GET",
    query: {
      region_id: region.id,
      q: query,
      category_id: categoryIds, // parent + all children
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
    },
    cache: "no-store",
  })

  return products || []
}

