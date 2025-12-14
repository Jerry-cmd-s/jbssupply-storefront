import { v4 as uuidv4 } from "uuid"
import type { Bundle, BundleItem } from "types/bundle"

export async function saveBundle(
  sdk: any,
  name: string,
  items: BundleItem[]
) {
  // 1. Get logged-in customer
  const { customer } = await sdk.store.customer.retrieve()

  if (!customer) {
    throw new Error("User not authenticated")
  }

  const existing: Bundle[] =
    (customer.metadata?.bundles as Bundle[]) || []

  const newBundle: Bundle = {
    id: uuidv4(),
    name: name.trim(),
    items,
    created_at: new Date().toISOString(),
  }

  // 2. IMPORTANT: use raw fetch
  await sdk.client.fetch("/store/customers/me", {
    method: "POST",
    body: {
      metadata: {
        ...customer.metadata,
        bundles: [...existing, newBundle],
      },
    },
  })

  return newBundle
}

export async function getSavedBundles(sdk: any): Promise<Bundle[]> {
  try {
    const { customer } = await sdk.store.customer.retrieve()
    return (customer?.metadata?.bundles as Bundle[]) || []
  } catch {
    return []
  }
}

export async function deleteBundle(sdk: any, bundleId: string) {
  const { customer } = await sdk.store.customer.retrieve()
  if (!customer) return

  const bundles =
    (customer.metadata?.bundles as Bundle[]) || []

  await sdk.client.fetch("/store/customers/me", {
    method: "POST",
    body: {
      metadata: {
        ...customer.metadata,
        bundles: bundles.filter((b) => b.id !== bundleId),
      },
    },
  })
}
