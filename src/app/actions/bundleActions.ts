// src/app/actions/bundleActions.ts
"use server";
import { HttpTypes } from "@medusajs/types"
import { v4 as uuidv4 } from "uuid";
import { sdk } from "@lib/config";
//import { getAuthHeaders } from "@lib/data/cookies";
import { revalidatePath } from "next/cache";
import { getCacheTag } from "@lib/data/cookies"; // Added to match your cart page cache revalidation
import {
  getAuthHeaders,
  getCacheOptions,
 // getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "@lib/data/cookies"
//import { getRegion } from "./regions"
type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

type Bundle = {
  id: string;
  name: string;
  items: BundleItem[];
  created_at: string;
};

/* Save a new bundle to customer metadata */
export async function saveBundleAction(name: string, items: BundleItem[]) {
  try {
    const { customer } = await sdk.store.customer.retrieve();

    if (!customer) {
      return { success: false, error: "No logged-in customer" };
    }

    const existingBundles: Bundle[] = (customer.metadata?.bundles as Bundle[]) || [];

    const newBundle: Bundle = {
      id: uuidv4(),
      name: name.trim(),
      items,
      created_at: new Date().toISOString(),
    };

    await sdk.store.customer.update({
      metadata: {
        ...customer.metadata,
        bundles: [...existingBundles, newBundle],
      },
    });

    revalidatePath("/account/bundles");
    return { success: true, bundle: newBundle };
  } catch (err: any) {
    console.error("Save bundle action failed:", err);
    return { success: false, error: err.message || "Failed to save bundle" };
  }
}

/* Load saved bundles from customer metadata */
export async function getSavedBundlesAction() {
  try {
    const { customer } = await sdk.store.customer.retrieve();
    return { success: true, bundles: (customer?.metadata?.bundles as Bundle[]) || [] };
  } catch (err) {
    console.error("Load bundles action failed:", err);
    return { success: false, bundles: [] };
  }
}
/* Add bundle to cart — clears current cart first, then adds bundle items, then refreshes cache */
export async function addBundleToCartAction(bundleItems: BundleItem[]) {
  const headers = await getAuthHeaders();

  try {
    // Get or create cart
    let cart = await sdk.store.cart.retrieve(undefined, headers as any);

    if (!cart) {
      // Create new cart (fallback region ID — adjust if needed)
      const { cart: newCart } = await sdk.store.cart.create({ region_id: "reg_01" }, headers as any);
      cart = newCart;
      await setCartId(cart.id);
    }

    // Clear all existing line items
    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await sdk.store.cart.deleteLineItem(cart.id, item.id, headers as any);
      }
    }

    // Add bundle items
    for (const item of bundleItems) {
      await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
        },
        headers as any
      );
    }

    // Revalidate cache (matching your cart page)
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    const fulfillmentCacheTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentCacheTag);

    return { success: true, message: "Bundle added to cart successfully!" };
  } catch (err: any) {
    console.error("Add bundle to cart failed:", err);
    return { success: false, error: err.message || "Failed to add bundle to cart" };
  }
}