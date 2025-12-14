// src/lib/util/bundleUtils.ts
import { v4 as uuidv4 } from 'uuid';
import type { Bundle, BundleItem } from 'types/bundle';
import { getAuthHeaders } from "lib/data/cookies"; // ← same as in orders.ts

export async function saveBundle(sdk: any, name: string, items: BundleItem[]) {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.store.customer.retrieve({}, { headers });

    if (!customer) {
      throw new Error('No logged-in customer found');
    }

    const existingBundles: Bundle[] = (customer.metadata?.bundles as Bundle[]) || [];

    const newBundle: Bundle = {
      id: uuidv4(),
      name: name.trim(),
      items,
      created_at: new Date().toISOString(),
    };

    await sdk.store.customer.update(
      {
        metadata: {
          ...customer.metadata,
          bundles: [...existingBundles, newBundle],
        },
      },
      { headers }
    );

    return newBundle;
  } catch (err: any) {
    console.error('Save bundle failed:', err);
    throw err;
  }
}

export async function getSavedBundles(sdk: any): Promise<Bundle[]> {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.store.customer.retrieve({}, { headers });
    return (customer?.metadata?.bundles as Bundle[]) || [];
  } catch (err) {
    console.error('Load bundles failed:', err);
    return [];
  }
}

export async function deleteBundle(sdk: any, bundleId: string) {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.store.customer.retrieve({}, { headers });
    if (!customer) return;

    const bundles = (customer.metadata?.bundles as Bundle[]) || [];
    const updated = bundles.filter((b: Bundle) => b.id !== bundleId);

    await sdk.store.customer.update(
      {
        metadata: {
          ...customer.metadata,
          bundles: updated,
        },
      },
      { headers }
    );
  } catch (err) {
    console.error('Delete bundle failed:', err);
  }
}