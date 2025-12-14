// src/lib/util/bundleUtils.ts
import { v4 as uuidv4 } from 'uuid';
import type { Bundle, BundleItem } from 'types/bundle';

// Helper to get the session cookie (only runs in browser)
const getSessionHeaders = () => {
  if (typeof document === 'undefined') return {};
  const session = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='))
    ?.split('=')[1];
  return session ? { Cookie: `session=${session}` } : {};
};

export async function saveBundle(sdk: any, name: string, items: BundleItem[]) {
  try {
    const headers = getSessionHeaders();

    const { customer } = await sdk.store.customer.retrieve({ headers });

    if (!customer) {
      throw new Error('No logged-in customer found. Please log in again.');
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

    console.log('Bundle saved with session auth:', newBundle);
    return newBundle;
  } catch (err: any) {
    console.error('Save bundle failed:', err);
    throw new Error(err.message || 'Failed to save bundle');
  }
}

export async function getSavedBundles(sdk: any): Promise<Bundle[]> {
  try {
    const headers = getSessionHeaders();
    const { customer } = await sdk.store.customer.retrieve({ headers });
    return (customer?.metadata?.bundles as Bundle[]) || [];
  } catch (err) {
    console.error('Load bundles failed:', err);
    return [];
  }
}

export async function deleteBundle(sdk: any, bundleId: string) {
  try {
    const headers = getSessionHeaders();
    const { customer } = await sdk.store.customer.retrieve({ headers });
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