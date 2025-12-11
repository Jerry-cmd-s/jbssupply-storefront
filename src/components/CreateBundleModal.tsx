// src/components/CreateBundleModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { sdk } from '@lib/config';
import { saveBundle } from '@lib/util/bundleUtils';
import { HttpTypes } from '@medusajs/types';

type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateBundleModal({ isOpen, onClose }: Props) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [selected, setSelected] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setBundleName('');
      return;
    }

    const fetchProducts = async () => {
      try {
        const { products } = await sdk.store.product.list({
          limit: 200,
          fields: "id,title,thumbnail,variants.id,variants.title,variants.prices.amount",
        });

        // Filter out products with no variants (safety)
        const validProducts = products.filter(
          (p): p is HttpTypes.StoreProduct =>
            Array.isArray(p.variants) && p.variants.length > 0
        );

        setProducts(validProducts);
      } catch (err) {
        console.error("Failed to load products:", err);
        alert("Could not load products. Please refresh.");
      }
    };

    fetchProducts();
  }, [isOpen]);

  const toggleItem = (product: HttpTypes.StoreProduct, variantId: string) => {
    setSelected((prev) => {
      const exists = prev.find((i) => i.variant_id === variantId);
      if (exists) {
        return prev.map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product_id: product.id, variant_id: variantId, quantity: 1 }];
    });
  };

  const updateQty = (variantId: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((i) =>
          i.variant_id === variantId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const handleSave = async () => {
    if (!bundleName.trim()) return alert('Please enter a bundle name');
    if (selected.length === 0) return alert('Add at least one item');

    setLoading(true);
    try {
      await saveBundle(sdk, bundleName.trim(), selected);
      alert('Bundle saved successfully!');
      onClose();
    } catch (err) {
      alert('Failed to save bundle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-8 py-5">
          <h2 className="text-3xl font-bold">Create Your Bundle</h2>
          <button
            onClick={onClose}
            className="rounded-full p-3 hover:bg-gray-200 transition"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-800">
              Choose Products ({products.length} available)
            </h3>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const variant = product.variants![0];
                const isAdded = selected.some((i) => i.variant_id === variant.id);
                const price = variant.prices?.[0]?.amount || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleItem(product, variant.id)}
                    className={`group cursor-pointer rounded-xl border-2 p-5 text-center transition-all ${
                      isAdded
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow'
                    }`}
                  >
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="mx-auto mb-4 h-40 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mx-auto mb-4 h-40 rounded-lg bg-gray-200" />
                    )}
                    <p className="font-medium text-gray-900 line-clamp-2">
                      {product.title}
                    </p>
                    {price > 0 && (
                      <p className="mt-2 text-lg font-bold text-purple-600">
                        ${(price / 100).toFixed(2)}
                      </p>
                    )}
                    <span
                      className={`mt-4 inline-block rounded-full px-6 py-2 text-sm font-bold transition ${
                        isAdded
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 group-hover:bg-purple-600 group-hover:text-white'
                      }`}
                    >
                      {isAdded ? 'Added' : '+ Add'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-full border-t bg-gray-50 p-8 md:w-96 md:border-l md:border-t-0">
            <h3 className="mb-6 text-xl font-semibold">Your Bundle Preview</h3>

            <input
              type="text"
              placeholder="e.g. Monthly Cleaning Kit"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-5 py-4 text-lg focus:border-purple-500 focus:outline-none"
            />

            <div className="mt-8 max-h-96 space-y-4 overflow-y-auto">
              {selected.length === 0 ? (
                <p className="py-12 text-center text-gray-500">
                  No items added yet
                </p>
              ) : (
                selected.map((item) => {
                  const product = products.find((p) => p.id === item.product_id);
                  return (
                    <div
                      key={item.variant_id}
                      className="flex items-center justify-between rounded-xl bg-white p-5 shadow"
                    >
                      <span className="font-medium text-gray-800">
                        {product?.title}
                      </span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateQty(item.variant_id, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-lg font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variant_id, +1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !bundleName.trim() || selected.length === 0}
              className="mt-10 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-5 text-xl font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Saving Bundle...' : 'Save Bundle to My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}