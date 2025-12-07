// components/CreateBundleModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { BundleItem } from 'types/bundle';
import { saveBundle } from '@lib/util/bundleUtils'; // ← the one we wrote earlier
import { X } from 'lucide-react';

type Product = {
  id: string;
  title: string;
  thumbnail?: string;
  variants: { id: string; title: string; prices: { amount: number }[] }[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sdk: any; // your Medusa client
};

export default function CreateBundleModal({ isOpen, onClose, sdk }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all products when modal opens
  useEffect(() => {
    if (isOpen) {
      sdk.products.list({ limit: 100 })
        .then(({ products }: { products: Product[] }) => setProducts(products))
        .catch(() => alert('Failed to load products'));
    } else {
      // Reset when closed
      setSelectedItems([]);
      setBundleName('');
    }
  }, [isOpen, sdk]);

  const addItem = (product: Product, variantId: string) => {
    const existing = selectedItems.find(
      i => i.variant_id === variantId
    );

    if (existing) {
      setSelectedItems(
        selectedItems.map(i =>
          i.variant_id === variantId ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          product_id: product.id,
          variant_id: variantId,
          quantity: 1,
        },
      ]);
    }
  };

  const removeItem = (variantId: string) => {
    setSelectedItems(selectedItems.filter(i => i.variant_id !== variantId));
  };

  const changeQty = (variantId: string, delta: number) => {
    setSelectedItems(
      selectedItems.map(i => {
        if (i.variant_id === variantId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean) as BundleItem[]
    );
  };

  const handleSave = async () => {
    if (!bundleName.trim()) return alert('Please give your bundle a name!');
    if (selectedItems.length === 0) return alert('Add at least one product');

    setLoading(true);
    try {
      await saveBundle(sdk, bundleName.trim(), selectedItems);
      alert('Bundle saved!');
      onClose();
    } catch (err) {
      alert('Failed to save bundle');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Create Your Bundle</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left: Product Grid */}
          <div className="w-full md:w-3/5 overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">Choose Products</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => {
                const variant = product.variants[0]; // use first variant (or make selectable later)
                const isAdded = selectedItems.some(i => i.variant_id === variant.id);

                return (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 text-center cursor-pointer transition ${
                      isAdded ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                    }`}
                    onClick={() => addItem(product, variant.id)}
                  >
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.title} className="w-full h-32 object-cover rounded mb-2" />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 mb-2" />
                    )}
                    <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {variant.prices[0]?.amount ? `$${(variant.prices[0].amount / 100).toFixed(2)}` : '—'}
                    </p>
                    <button className="mt-3 bg-blue-600 text-white text-xs px-4 py-2 rounded-full hover:bg-blue-700">
                      {isAdded ? 'Added ✓' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Preview + Name */}
          <div className="w-full md:w-2/5 bg-gray-50 p-6 border-l overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Your Bundle Preview</h3>

            <input
              type="text"
              placeholder="e.g. Weekly Cleaning Kit"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-6 text-lg"
            />

            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items yet – start adding!</p>
            ) : (
              <div className="space-y-3">
                {selectedItems.map(item => {
                  const product = products.find(p => p.id === item.product_id);
                  const variant = product?.variants.find(v => v.id === item.variant_id);
                  return (
                    <div key={item.variant_id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{product?.title || 'Product'}</p>
                        <p className="text-sm text-gray-500">{variant?.title || ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => changeQty(item.variant_id, -1)} className="w-8 h-8 rounded-full bg-gray-200">-</button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button onClick={() => changeQty(item.variant_id, +1)} className="w-8 h-8 rounded-full bg-gray-200">+</button>
                        <button onClick={() => removeItem(item.variant_id)} className="text-red-500 ml-4">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading || selectedItems.length === 0 || !bundleName}
              className="w-full mt-8 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save Bundle to My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}