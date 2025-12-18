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
import { cookies } from "next/headers";


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
  try {
    const cookieStore = cookies();
    let cartId = cookieStore.get("_medusa_cart_id")?.value;
    let cart;

    // Retrieve cart
    if (cartId) {
      const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
        credentials: "include",
      });

      if (res.ok) {
        cart = (await res.json()).cart;
      }
    }

    // Create cart if needed
    if (!cart) {
      const res = await fetch(`${MEDUSA_URL}/store/carts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region_id: "us" }),
      });

      cart = (await res.json()).cart;

      cookieStore.set("_medusa_cart_id", cart.id, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // Clear cart
    for (const item of cart.items || []) {
      await fetch(
        `${MEDUSA_URL}/store/carts/${cart.id}/line-items/${item.id}`,
        { method: "DELETE", credentials: "include" }
      );
    }

    // Add bundle items
    for (const item of bundleItems) {
      await fetch(`${MEDUSA_URL}/store/carts/${cart.id}/line-items`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: item.variant_id,
          quantity: item.quantity,
        }),
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Add bundle to cart failed:", err);
    return { success: false, error: err.message };
  }
}