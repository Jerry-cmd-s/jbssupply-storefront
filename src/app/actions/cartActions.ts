"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCartId, setCartId } from "@lib/data/cookies"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { getCacheTag } from "@lib/data/cookies"

export async function addToCartAction(
  variantId: string,
  quantity: number = 1
) {
  const headers = await getAuthHeaders()

  try {
    let cartId = await getCartId()
    let cart: HttpTypes.StoreCart | null = null

    // 1. Try to retrieve existing cart
    if (
      cartId &&
      typeof cartId === "string" &&
      cartId.trim() !== "" &&
      cartId !== "undefined"
    ) {
      try {
        const { cart: retrievedCart } = await sdk.store.cart.retrieve(
          cartId,
          {},
          headers
        )
        cart = retrievedCart
      } catch (err) {
        // Invalid cart cookie → clear it
        cookies().delete("_medusa_cart_id")
        cartId = undefined
      }
    }

    // 2. Create cart if none exists
    if (!cart) {
      const region = await getRegion("us") // make dynamic later if needed
      if (!region) throw new Error("No region found")

      const { cart: newCart } = await sdk.store.cart.create(
        { region_id: region.id },
        {},
        headers
      )

      cart = newCart
      await setCartId(cart.id)
    }

    // 3. Add item (do NOT delete anything)
    await sdk.store.cart.createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )

    // 4. Re-fetch cart for consistency
    const { cart: finalCart } = await sdk.store.cart.retrieve(
      cart.id,
      {},
      headers
    )

    // 5. Revalidate cache
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    return {
      success: true,
      message: "Item added to cart",
      cart: finalCart,
    }
  } catch (err: any) {
    console.error("Add to cart failed:", err)

    return {
      success: false,
      error: err?.message || "Failed to add item to cart",
    }
  }
}
