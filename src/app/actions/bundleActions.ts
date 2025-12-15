// src/app/actions/bundleActions.ts
"use server";

import { v4 as uuidv4 } from 'uuid';
import { sdk } from '@lib/config';
import { getAuthHeaders } from '@lib/data/cookies';
import { revalidatePath } from 'next/cache';

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
    const { customer } = await sdk.store.customer.retrieve(undefined, headers);

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

    await sdk.store.customer.update(
      {
        metadata: {
          ...customer.metadata,
          bundles: [...existingBundles, newBundle],
        },
      },
      headers
    );

    revalidatePath('/account/bundles');
    return { success: true, bundle: newBundle };
  } catch (err: any) {
    console.error('Save bundle action failed:', err);
    return { success: false, error: err.message || 'Failed to save bundle' };
  }
}

export async function getSavedBundlesAction() {
  const headers = await getAuthHeaders();

  try {
    const { customer } = await sdk.store.customer.retrieve(undefined, headers);
    return { success: true, bundles: (customer?.metadata?.bundles as Bundle[]) || [] };
  } catch (err) {
    console.error('Load bundles action failed:', err);
    return { success: false, bundles: [] };
  }
}