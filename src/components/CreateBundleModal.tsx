// src/components/CreateBundleModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { BundleItem } from "types/bundle";
import { saveBundle } from 'lib/util/bundleUtils';
import { X } from 'lucide-react';

type Product = {
  id: string;
  title: string;
  thumbnail?: string;
  variants: { id: string; prices?: { amount?: number }[] }[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sdk: any;
};

export default function CreateBundleModal({ isOpen, onClose, sdk }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<BundleItem[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sdk.products.list({ limit: 500 })
        .then(({ products }) => setProducts(products)));
    } else {
      setSelected([]);
      setName('');
    }
  }, [isOpen, sdk]);

  const toggleItem = (product: Product, variantId: string) => {
    setSelected(prev => {
      const exists = prev.find(i => i.variant_id === variantId);
      if (exists) {
        return prev.map(i => i.variant_id === variantId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product_id: product.id, variant_id: variantId, quantity: 1 }];
    });
  };

  const updateQty = (variantId: string, delta: number) => {
    setSelected(prev => prev
      .map(i => i.variant_id === variantId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Give your bundle a name');
    if (selected.length === 0) return alert('Add at least one product');
    setLoading(true);
    await saveBundle(sdk, name.trim(), selected);
    setLoading(false);
    alert('Bundle saved!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Create Bundle</h2>
          <button onClick={onClose}><X className="w-7 h-7" /></button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Products grid */}
          <div className="md:w-3/5 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => {
                const v = p.variants[0];
                const added = selected.some(i => i.variant_id === v.id);
                return (
                  <div key={p.id} onClick={() => toggleItem(p, v.id)} className={`border-2 rounded-lg p-4 text-center cursor-pointer ${added ? 'border-blue-500 bg-blue-50' : ''}`}>
                    {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-full h-32 object-cover rounded" /> : <div className="bg-gray-200 h-32 rounded" />}
                    <p className="mt-2 font-medium text-sm">{p.title}</p>
                    <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                      {added ? 'Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="md:w-2/5 bg-gray-50 p-6 border-l">
            <input
              className="w-full border rounded-lg px-4 py-3 text-lg mb-6"
              placeholder="Bundle name (e.g. Weekly Restock)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {selected.map(item => {
              const prod = products.find(p => p.id === item.product_id);
              return (
                <div key={item.variant_id} className="bg-white p-4 rounded mb-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{prod?.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(item.variant_id, -1)}>-</button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.variant_id, +1)}>+</button>
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleSave}
              disabled={loading || !name || selected.length === 0}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold mt-8 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Bundle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}