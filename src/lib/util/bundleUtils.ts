// src/lib/util/bundle-utils.ts
import { v4 as uuidv4 } from 'uuid';
import type { Bundle, BundleItem } from "types/bundle"
import { types } from 'util';

export async function saveBundle(
  sdk: any,
  name: string,
  items: BundleItem[]
) {
  try {
    const { customer } = await sdk.customers.retrieve();
    console.log('Current customer:', customer); // ← check if customer exists

    const existingBundles: Bundle[] = (customer.metadata?.bundles as Bundle[]) || [];

    const newBundle: Bundle = {
      id: uuidv4(),
      name: name.trim(),
      items,
      created_at: new Date().toISOString(),
    };

    await sdk.customers.update({
      metadata: {
        ...customer.metadata,
        bundles: [...existingBundles, newBundle],
      },
    });

    console.log('Bundle saved successfully:', newBundle);
    return newBundle;
  } catch (err) {
    console.error('Save bundle error:', err); // ← this will show the REAL error in console
    throw err; // re-throw so alert shows
  }
}

export async function getSavedBundles(sdk: any): Promise<Bundle[]> {
  const { customer } = await sdk.customers.retrieve();
  return (customer.metadata?.bundles as Bundle[]) || [];
}

export async function deleteBundle(sdk: any, bundleId: string) {
  const bundles = await getSavedBundles(sdk);
  await sdk.customers.update({
    metadata: {
      bundles: bundles.filter((b: Bundle) => b.id !== bundleId),
    },
  });
}