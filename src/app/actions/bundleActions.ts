// src/app/actions/bundleActions.ts
"use server";

import { v4 as uuidv4 } from "uuid";
import { sdk } from "@lib/config";
import { getAuthHeaders } from "@lib/data/cookies";
import { revalidatePath } from "next/cache";
import { getRegion } from "lib/data/regions";
import { getCartId,setCartId, } from "@lib/data/cookies";
const MEDUSA_URL = "https://jbssupply.medusajs.app";
import type { BundleItem } from "types/bundle";



export async function saveBundleAction(name: string, items: BundleItem[]) {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });

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





export async function getSavedBundlesAction() {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });

    return { success: true, bundles: (customer?.metadata?.bundles as Bundle[]) || [] };
  } catch (err) {
    console.error("Load bundles action failed:", err);
    return { success: false, bundles: [] };
  }
}






export async function addBundleToCartAction(bundleItems: BundleItem[]) {
  const headers = await getAuthHeaders();
  const cartConfig = { headers }; // Wrap headers in config object

  try {
    // Get existing cart ID from cookies
    let cartId = await getCartId();
    console.log("Fetched cartId:", cartId, typeof cartId); // Debug log
    let cart;

    if (cartId && typeof cartId === 'string' && cartId.trim() !== '' && cartId !== 'undefined') {
      try {
        // Retrieve existing cart (cartId first, then config)
        cart = await sdk.store.cart.retrieve(cartId, cartConfig);
      } catch (err) {
        console.error("Failed to retrieve existing cart:", err);
        // Proceed to create new if retrieval fails
      }
    }

    // Create new cart if none exists or retrieval failed
    if (!cart) {
      const region = await getRegion("us"); // fallback — adjust if needed
      if (!region) throw new Error("No region found");
      const { cart: newCart } = await sdk.store.cart.create(
        { region_id: region.id },
        cartConfig // config last
      );
      cart = newCart;
      await setCartId(cart.id);
    }

    // CLEAR ALL EXISTING LINE ITEMS
    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await sdk.store.cart.deleteLineItem(
          cart.id,
          item.id,
          cartConfig // config last
        );
      }
    }

    // ADD BUNDLE ITEMS
    for (const item of bundleItems) {
      await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
        },
        cartConfig // config last
      );
    }

    // Optionally re-fetch cart to confirm updates
    cart = await sdk.store.cart.retrieve(cart.id, cartConfig);

    // Revalidate cache
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    const fulfillmentCacheTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentCacheTag);

    return { success: true, message: "Bundle loaded into cart!", cart };
  } catch (err: any) {
    console.error("Add bundle to cart failed:", err);
    return { success: false, error: err.message || "Failed to load bundle into cart" };
  }
}