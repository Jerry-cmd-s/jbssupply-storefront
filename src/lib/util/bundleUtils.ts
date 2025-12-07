import { v4 as uuidv4 } from 'uuid'; // Install uuid if needed: npm i uuid

export async function saveBundle(sdk: any, bundleName: string, selectedItems: BundleItem[]) {
  const customer = await sdk.customers.retrieve();
  const existingBundles: Bundle[] = customer.metadata?.bundles || [];

  const newBundle: Bundle = {
    id: uuidv4(), // Better than crypto.randomUUID() for cross-browser
    name: bundleName,
    items: selectedItems,
    created_at: new Date().toISOString(),
  };

  await sdk.customers.update({
    metadata: {
      bundles: [...existingBundles, newBundle],
    },
  });

  return newBundle; // Return for UI feedback
}