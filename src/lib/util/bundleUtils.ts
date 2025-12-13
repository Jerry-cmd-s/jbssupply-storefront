// src/lib/util/bundleUtils.ts
import { v4 as uuidv4 } from 'uuid';
import type { Bundle, BundleItem } from 'types/bundle';

export async function saveBundle(sdk: any, name: string, items: BundleItem[]) {
  try {
    // NEW SDK WAY: Get logged-in customer
    const { customer } = await sdk.store.customer.retrieve();

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

    // Update customer metadata with new bundle
    await sdk.store.customer.update({
      metadata: {
        ...customer.metadata,
        bundles: [...existingBundles, newBundle],
      },
    });

    return newBundle;
  } catch (err) {
    console.error('Save bundle failed:', err);
    throw err; // This triggers the alert in the modal
  }
}

export async function getSavedBundles(sdk: any): Promise<Bundle[]> {
  try {
    const { customer } = await sdk.store.customer.retrieve();
    return (customer?.metadata?.bundles as Bundle[]) || [];
  } catch (err) {
    console.error('Load bundles failed:', err);
    return [];
  }
}

export async function deleteBundle(sdk: any, bundleId: string) {
  try {
    const { customer } = await sdk.store.customer.retrieve();

    if (!customer) return;

    const bundles = (customer.metadata?.bundles as Bundle[]) || [];
    const updated = bundles.filter((b: Bundle) => b.id !== bundleId);

    await sdk.store.customer.update({
      metadata: {
        ...customer.metadata,
        bundles: updated,
      },
    });
  } catch (err) {
    console.error('Delete bundle failed:', err);
  }
}