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
  const authHeaders = await getAuthHeaders();

  // Clean the headers so TypeScript and SDK are happy
  const cleanHeaders: Record<string, string> = {};
  if ("authorization" in authHeaders && authHeaders.authorization) {
    cleanHeaders.authorization = authHeaders.authorization;
  }

  try {
    const { customer } = await sdk.store.customer.retrieve(undefined, cleanHeaders);

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
      cleanHeaders
    );

    revalidatePath('/account/bundles');
    return { success: true, bundle: newBundle };
  } catch (err: any) {
    console.error('Save bundle action failed:', err);
    return { success: false, error: err.message || 'Failed to save bundle' };
  }
}

export async function getSavedBundlesAction() {
  const authHeaders = await getAuthHeaders();

  // Same cleaning
  const cleanHeaders: Record<string, string> = {};
  if ("authorization" in authHeaders && authHeaders.authorization) {
    cleanHeaders.authorization = authHeaders.authorization;
  }

  try {
    const { customer } = await sdk.store.customer.retrieve(undefined, cleanHeaders);
    return { success: true, bundles: (customer?.metadata?.bundles as Bundle[]) || [] };
  } catch (err) {
    console.error('Load bundles action failed:', err);
    return { success: false, bundles: [] };
  }
}