"use server";

import { v4 as uuidv4 } from "uuid";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheTag } from "@lib/data/cookies";
import { revalidatePath, revalidateTag } from "next/cache";
import { getRegion } from "lib/data/regions";
import { getCartId, setCartId } from "@lib/data/cookies";
import { cookies } from "next/headers";
import type { BundleItem } from "types/bundle";
import { HttpTypes } from "@medusajs/types";

/* =======================
   TYPES
======================= */

export type DeliverySchedule = {
  interval_type: "days" | "weeks" | "months";
  interval_count: number;
  start_date: string;
  day_of_month?: number;
  weekday?: number;
};

type Bundle = {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  items: BundleItem[];
  delivery_schedule: DeliverySchedule;
};

/* =======================
   SAVE BUNDLE
======================= */

export async function saveBundleAction(
  name: string,
  items: BundleItem[],
  delivery_schedule: DeliverySchedule
) {
  const headers = await getAuthHeaders();

  if (!name.trim()) {
    return { success: false, error: "Bundle name is required" };
  }

  if (!items.length) {
    return { success: false, error: "Bundle must contain at least one item" };
  }

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });

    if (!customer) {
      return { success: false, error: "No logged-in customer" };
    }

    const existingBundles: Bundle[] =
      (customer.metadata?.bundles as Bundle[]) || [];

    const newBundle: Bundle = {
      id: uuidv4(),
      name: name.trim(),
      items,
      delivery_schedule,
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
    console.error("Save bundle failed:", err);
    return { success: false, error: err.message || "Failed to save bundle" };
  }
}

/* =======================
   GET BUNDLES
======================= */

export async function getSavedBundlesAction() {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });

    return {
      success: true,
      bundles: (customer?.metadata?.bundles as Bundle[]) || [],
    };
  } catch (err) {
    console.error("Load bundles failed:", err);
    return { success: false, bundles: [] };
  }
}

/* =======================
   UPDATE BUNDLE
======================= */

export async function updateBundleAction(
  bundleId: string,
  name: string,
  items: BundleItem[],
  delivery_schedule: DeliverySchedule
) {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });

    if (!customer) {
      return { success: false, error: "No logged-in customer" };
    }

    const existingBundles: Bundle[] =
      (customer.metadata?.bundles as Bundle[]) || [];

    let found = false;

    const updatedBundles = existingBundles.map((bundle) => {
      if (bundle.id === bundleId) {
        found = true;
        return {
          ...bundle,
          name: name.trim(),
          items,
          delivery_schedule,
          updated_at: new Date().toISOString(),
        };
      }
      return bundle;
    });

    if (!found) {
      return { success: false, error: "Bundle not found" };
    }

    await sdk.client.fetch("/store/customers/me", {
      method: "POST",
      headers,
      body: {
        metadata: {
          ...customer.metadata,
          bundles: updatedBundles,
        },
      },
    });

    revalidatePath("/account/bundles");

    return { success: true };
  } catch (err: any) {
    console.error("Update bundle failed:", err);
    return { success: false, error: err.message || "Failed to update bundle" };
  }
}

/* =======================
   DELETE BUNDLE
======================= */

export async function deleteBundleAction(bundleId: string) {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });

    if (!customer) {
      return { success: false, error: "No logged-in customer" };
    }

    const existingBundles: Bundle[] =
      (customer.metadata?.bundles as Bundle[]) || [];

    const updatedBundles = existingBundles.filter(
      (bundle) => bundle.id !== bundleId
    );

    if (existingBundles.length === updatedBundles.length) {
      return { success: false, error: "Bundle not found" };
    }

    await sdk.client.fetch("/store/customers/me", {
      method: "POST",
      headers,
      body: {
        metadata: {
          ...customer.metadata,
          bundles: updatedBundles,
        },
      },
    });

    revalidatePath("/account/bundles");

    return { success: true };
  } catch (err: any) {
    console.error("Delete bundle failed:", err);
    return { success: false, error: err.message || "Failed to delete bundle" };
  }
}

/* =======================
   ADD BUNDLE TO CART
======================= */

export async function addBundleToCartAction(bundleItems: BundleItem[]) {
  const headers = await getAuthHeaders();

  try {
    let cartId = await getCartId();
    let cart: HttpTypes.StoreCart | null = null;

    if (cartId && cartId !== "undefined") {
      try {
        const { cart: retrievedCart } = await sdk.store.cart.retrieve(
          cartId,
          {},
          headers
        );
        cart = retrievedCart;
      } catch {
        cookies().delete("_medusa_cart_id");
        cartId = undefined;
      }
    }

    if (!cart) {
      const region = await getRegion("us");
      if (!region) throw new Error("No region found");

      const { cart: newCart } = await sdk.store.cart.create(
        { region_id: region.id },
        {},
        headers
      );

      cart = newCart;
      await setCartId(cart.id);
    }

    if (cart.items?.length) {
      for (const item of cart.items) {
        await sdk.store.cart.deleteLineItem(cart.id, item.id, {}, headers);
      }
    }

    for (const item of bundleItems) {
      await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
        },
        {},
        headers
      );
    }

    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);

    const fulfillmentCacheTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentCacheTag);

    return { success: true, message: "Bundle added to cart", cart };
  } catch (err: any) {
    console.error("Add bundle to cart failed:", err);
    return {
      success: false,
      error: err.message || "Failed to add bundle to cart",
    };
  }
}
