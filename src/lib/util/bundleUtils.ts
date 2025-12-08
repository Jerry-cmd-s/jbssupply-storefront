// src/lib/util/bundle-utils.ts
import { v4 as uuidv4 } from 'uuid';
import type { Bundle, BundleItem } from "types/bundle"
import { types } from 'util';

export async function saveBundle(sdk: any, name: string, items: BundleItem[]) {
  const { customer } = await sdk.customers.retrieve();

  const existing: Bundle[] = (customer.metadata?.bundles as Bundle[]) || [];

  const newBundle: Bundle = {
    id: uuidv4(),
    name,
    items,
    created_at: new Date().toISOString(),
  };

  await sdk.customers.update({
    metadata: {
      ...customer.metadata,
      bundles: [...existing, newBundle],
    },
  });

  return newBundle;
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