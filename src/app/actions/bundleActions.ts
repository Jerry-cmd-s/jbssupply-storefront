// src/app/actions/bundleActions.ts
"use server";

import { v4 as uuidv4 } from "uuid";
import { sdk } from "@lib/config";
import { getAuthHeaders } from "@lib/data/cookies";
import { revalidatePath } from "next/cache";
import { getRegion } from "lib/data/regions";
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
    let cartId = await getCartId();
    let cart;

    // 1️⃣ Retrieve existing cart
    if (cartId) {
      try {
        const res = await sdk.store.cart.retrieve(cartId);
        cart = res.cart;
      } catch {
        cartId = null;
      }
    }

    // 2️⃣ Create cart if missing
    if (!cart) {
      const region = await getRegion("us");
      if (!region) throw new Error("Region not found");

      const res = await sdk.store.cart.create({
        region_id: region.id,
      });

      cart = res.cart;
      await setCartId(cart.id);
    }

    // 3️⃣ Clear existing line items
    if (cart.items?.length) {
      await Promise.all(
        cart.items.map((item) =>
          sdk.store.cart.lineItems.delete(cart.id, item.id)
        )
      );
    }

    // 4️⃣ Add bundle items
    await Promise.all(
      bundleItems.map((item) =>
        sdk.store.cart.lineItems.create(cart.id, {
          variant_id: item.variant_id,
          quantity: item.quantity,
        })
      )
    );

    return {
      success: true,
      cart_id: cart.id,
    };
  } catch (err: any) {
    console.error("Add bundle to cart failed:", err);
    return {
      success: false,
      error: err.message ?? "Failed to add bundle to cart",
    };
  }
}