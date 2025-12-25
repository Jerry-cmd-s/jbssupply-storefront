"use server";

import { v4 as uuidv4 } from "uuid";
import { sdk } from "@lib/config";
import { getAuthHeaders, getCacheTag } from "@lib/data/cookies";
import { revalidatePath } from "next/cache";
import { getRegion } from "lib/data/regions";
import { getCartId, setCartId } from "@lib/data/cookies";
import { cookies } from "next/headers"; // Added for cookies().delete
import { revalidateTag } from "next/cache";
import type { BundleItem } from "types/bundle";
import { HttpTypes } from "@medusajs/types";

const MEDUSA_URL = "https://jbssupply.medusajs.app"; // Unused but kept for reference

// Define Bundle type for clarity (assuming it's not defined elsewhere)
type Bundle = {
  id: string;
  name: string;
  created_at: string;
  items: BundleItem[];
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

export async function updateBundleAction(
  bundleId: string,
  name: string,
  items: BundleItem[]
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
    console.error("Update bundle action failed:", err);
    return {
      success: false,
      error: err.message || "Failed to update bundle",
    };
  }
}




export async function deleteBundleAction(bundleId: string) {
  const headers = await getAuthHeaders();
  try {
    const { customer } = await sdk.client.fetch("/store/customers/me", {
      headers,
    });
    if (!customer) {
      return { success: false, error: "No logged-in customer" };
    }
    const existingBundles: Bundle[] = (customer.metadata?.bundles as Bundle[]) || [];
    console.log("Delete: Existing bundle IDs:", existingBundles.map(b => b.id)); // Debug: List all current IDs
    console.log("Delete: Target bundleId:", bundleId); // Debug: Incoming ID
    const updatedBundles = existingBundles.filter((bundle) => bundle.id !== bundleId);
    if (existingBundles.length === updatedBundles.length) {
      console.log("Delete: Bundle not found - no changes made"); // Debug: Confirm miss
      return { success: false, error: "Bundle not found" };
    }
    console.log("Delete: Bundles count after filter:", updatedBundles.length); // Debug: Confirm removal
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
    // Optional: Re-fetch to confirm persistence
    const { customer: updatedCustomer } = await sdk.client.fetch("/store/customers/me", { headers });
    console.log("Delete: Post-delete bundles count:", (updatedCustomer.metadata?.bundles as Bundle[] || []).length); // Debug: Verify saved
    revalidatePath("/account/bundles");
    return { success: true };
  } catch (err: any) {
    console.error("Delete bundle action failed:", err);
    return { success: false, error: err.message || "Failed to delete bundle" };
  }
}

export async function addBundleToCartAction(bundleItems: BundleItem[]) {
  const headers = await getAuthHeaders();
  try {
    // Get existing cart ID from cookies
    let cartId = await getCartId();
    console.log("Fetched cartId:", cartId, typeof cartId); // Debug: Check server logs
    let cart: HttpTypes.StoreCart | null = null;

    if (cartId && typeof cartId === "string" && cartId.trim() !== "" && cartId !== "undefined") {
      try {
        // Retrieve existing cart (matching your retrieveCart style)
        const { cart: retrievedCart } = await sdk.store.cart.retrieve(cartId, {}, headers);
        cart = retrievedCart;
        console.log("Retrieved cart successfully:", cart.id); // Debug
      } catch (err) {
        console.error("Failed to retrieve existing cart:", err);
        // Reset invalid cookie to prevent repeat issues
        cookies().delete("_medusa_cart_id"); // Adjust cookie name if different (e.g., 'cart_id')
        cartId = undefined; // Force creation
      }
    }

    // Create new cart if none exists or retrieval failed (similar to getOrSetCart)
    if (!cart) {
      const region = await getRegion("us"); // Fallback; make dynamic if needed (e.g., pass countryCode)
      if (!region) throw new Error("No region found");
      const { cart: newCart } = await sdk.store.cart.create(
        { region_id: region.id },
        {}, // Empty query
        headers
      );
      cart = newCart;
      await setCartId(cart.id);
      console.log("Created new cart:", cart.id); // Debug
    }

    // OPTIONAL: Pre-check inventory for bundle items (uncomment to enable; requires fetching variants)
    // for (const item of bundleItems) {
    //   const { variant } = await sdk.store.product.retrieveVariant(/* product_id if needed */, item.variant_id);
    //   if (variant.manage_inventory && variant.inventory_quantity < item.quantity) {
    //     throw new Error(`Insufficient inventory for variant ${item.variant_id}`);
    //   }
    // }

    // CLEAR ALL EXISTING LINE ITEMS
    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await sdk.store.cart.deleteLineItem(
          cart.id,
          item.id,
          {}, // Empty query
          headers
        );
      }
      console.log("Cleared existing items"); // Debug
      // Re-fetch cart to get updated items (Medusa might not auto-update in response)
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id, {}, headers);
      cart = updatedCart;
    }

    // ADD BUNDLE ITEMS
    for (const item of bundleItems) {
      await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
        },
        {}, // Empty query
        headers
      );
    }
    console.log("Added bundle items successfully"); // Debug

    // Re-fetch final cart to confirm (optional, but ensures consistency)
    const { cart: finalCart } = await sdk.store.cart.retrieve(cart.id, {}, headers);
    cart = finalCart;

    // Revalidate cache (matching your code)
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