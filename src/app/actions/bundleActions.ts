// src/app/actions/bundleActions.ts
"use server";

import { v4 as uuidv4 } from "uuid";
import { sdk } from "@lib/config";
import { getAuthHeaders } from "@lib/data/cookies";
import { revalidatePath } from "next/cache";

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

/* Save a new bundle */
export async function saveBundleAction(name: string, items: BundleItem[]) {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", { headers });

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

    await sdk.client.fetch("/store/customers/me", {
      method: "POST",
      headers,
      body: {
        metadata: {
          ...customer.metadata,
          bundles: [...existingBundles, newBundle],
        },
      },
    });

    revalidatePath("/account/bundles");
    return { success: true, bundle: newBundle };
  } catch (err: any) {
    console.error("Save bundle action failed:", err);
    return { success: false, error: err.message || "Failed to save bundle" };
  }
}

/* Load all saved bundles */
export async function getSavedBundlesAction() {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", { headers });
    return { success: true, bundles: (customer?.metadata?.bundles as Bundle[]) || [] };
  } catch (err) {
    console.error("Load bundles action failed:", err);
    return { success: false, bundles: [] };
  }
}

/* Add bundle to cart — clears current cart first, then adds bundle items */
export async function addBundleToCartAction(bundleItems: BundleItem[]) {
  const headers = await getAuthHeaders();

  try {
    // Get current cart or create one
    let cart = await sdk.store.cart.retrieve(undefined, headers);

    if (!cart) {
      // Create a new cart (fallback region "us" — you can make this dynamic if needed)
      const { cart: newCart } = await sdk.store.cart.create({ region_id: "reg_01" }, headers);
      cart = newCart;
      await setCartId(cart.id);
    }

    // CLEAR ALL EXISTING LINE ITEMS
    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await sdk.store.cart.lineItems.delete(cart.id, item.id, headers);
      }
    }

    // ADD BUNDLE ITEMS
    for (const item of bundleItems) {
      await sdk.store.cart.lineItems.create(
        cart.id,
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
        },
        headers
      );
    }

    // Revalidate cart cache
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    const fulfillmentCacheTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentCacheTag);

    return { success: true, message: "Bundle loaded into cart!" };
  } catch (err: any) {
    console.error("Add bundle to cart failed:", err);
    return { success: false, error: err.message || "Failed to load bundle into cart" };
  }
}