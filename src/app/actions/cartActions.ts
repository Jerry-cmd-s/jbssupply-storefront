// src/app/actions/cartActions.ts
"use server";

import { sdk } from "@lib/config";
import { getAuthHeaders } from "@lib/data/cookies";
import { getRegion } from "@lib/data/regions"; // Adjust if needed
import { getCartId, setCartId } from "@lib/data/cookies";


export async function addToCartAction(variantId: string, quantity: number = 1) {
  const headers = await getAuthHeaders();

  try {
    // Get or create cart
    let cart = await sdk.store.cart.retrieve(undefined, headers as any);

    if (!cart) {
      const region = await getRegion("us"); // fallback countryCode - adjust if needed
      if (!region) throw new Error("No region found");

      const { cart: newCart } = await sdk.store.cart.create({ region_id: region.id }, headers as any);
      cart = newCart;
    }

    // Add item
    await sdk.store.cart.createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      headers as any
    );

    // Revalidate cache
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    const fulfillmentCacheTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentCacheTag);

    return { success: true };
  } catch (err: any) {
    console.error("Add to cart failed:", err);
    return { success: false, error: err.message || "Failed to add to cart" };
  }
}