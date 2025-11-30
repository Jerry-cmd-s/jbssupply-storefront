"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthHeaders, getCartId, removeCartId, setCartId } from "./cookies"
import { getRegion } from "./regions"

export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??= "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"
  if (!id) return null

  const headers = await getAuthHeaders()
  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: { fields },
      headers,
      cache: "force-cache",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  let cart = await retrieveCart(undefined, "id,region_id")
  const headers = await getAuthHeaders()

  if (!cart) {
    const cartResp = await sdk.store.cart.create({ region_id: region.id }, {}, headers)
    cart = cartResp.cart
    await setCartId(cart.id)
  }

  if (cart && cart.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
  }

  // Hardcoded revalidate – no more getCacheTag() bugs
  revalidateTag("carts")
  revalidateTag("cart")
  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found")

  const headers = await getAuthHeaders()
  const { cart } = await sdk.store.cart.update(cartId, data, {}, headers)

  revalidateTag("carts")
  revalidateTag("cart")
  revalidateTag("fulfillment")
  return cart
}

export async function addToCart({
  variantId,
  quantity = 1,
  countryCode,
}: {
  variantId: string
  quantity?: number
  countryCode: string
}) {
  if (!variantId) throw new Error("Missing variant ID")

  const cart = await getOrSetCart(countryCode)
  const freshCart = await retrieveCart(cart.id)
  if (!freshCart) throw new Error("Failed to load cart")

  const headers = await getAuthHeaders()
  const existingItem = freshCart.items?.find((i) => i.variant_id === variantId)

  if (existingItem) {
    const newQty = existingItem.quantity + quantity
    await sdk.store.cart.updateLineItem(cart.id, existingItem.id, { quantity: newQty }, {}, headers)
  } else {
    await sdk.store.cart.createLineItem(cart.id, { variant_id: variantId, quantity }, {}, headers)
  }

  // These three lines are the magic that fixes everything in production
  revalidateTag("carts")
  revalidateTag("cart")
  revalidateTag("fulfillment")
}

export async function updateLineItem({ lineId, quantity }: { lineId: string; quantity: number }) {
  const cartId = await getCartId()
  if (!cartId || !lineId) throw new Error("Missing cart or line item")

  const headers = await getAuthHeaders()
  await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, {}, headers)

  revalidateTag("carts")
  revalidateTag("cart")
  revalidateTag("fulfillment")
}

export async function deleteLineItem(lineId: string) {
  const cartId = await getCartId()
  if (!cartId || !lineId) throw new Error("Missing cart or line item")

  const headers = await getAuthHeaders()
  await sdk.store.cart.deleteLineItem(cartId, lineId, headers)

  revalidateTag("carts")
  revalidateTag("cart")
  revalidateTag("fulfillment")
}

// Keep the rest of your functions exactly as before but with hardcoded revalidateTag
// ... (setShippingMethod, placeOrder, updateRegion, etc.)

export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("No cart")

  const headers = await getAuthHeaders()
  const cartRes = await sdk.store.cart.complete(id, {}, headers)

  revalidateTag("carts")
  revalidateTag("cart")

  if (cartRes?.type === "order") {
    const countryCode = cartRes.order.shipping_address?.country_code?.toLowerCase() || "us"
    removeCartId()
    redirect(`/${countryCode}/order/${cartRes.order.id}/confirmed`)
  }
  return cartRes.cart
}

export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)
  if (!region) throw new Error("Region not found")

  if (cartId) {
    await updateCart({ region_id: region.id })
  }

  revalidateTag("regions")
  revalidateTag("products")
  redirect(`/${countryCode}${currentPath}`)
}

// Add this at the very bottom if you want to be 1000% sure
// Some components still listen to the old "cart" tag
export async function refreshCart() {
  revalidateTag("carts")
  revalidateTag("cart")
  revalidateTag("fulfillment")
}