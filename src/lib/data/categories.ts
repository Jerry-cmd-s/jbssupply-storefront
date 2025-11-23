import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

/**
 * List all categories (cached)
 */
export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

/**
 * Get a single category by its handle (e.g., "restaurant-supplies")
 */
export const getCategoryByHandle = async (categoryHandle: string) => {
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        handle: categoryHandle,
        fields: "*category_children, *products, *parent_category, *parent_category.parent_category",
      },
      next: { revalidate: 0 }, // disables Next.js caching
      cache: "no-store", // ensures it's not stored in memory
    })

    if (!product_categories || product_categories.length === 0) {
      console.warn(`Category not found for handle: ${categoryHandle}`)
      return null
    }

    return product_categories[0]
  } catch (error) {
    console.error("Error fetching category by handle:", error)
    return null
  }
}
