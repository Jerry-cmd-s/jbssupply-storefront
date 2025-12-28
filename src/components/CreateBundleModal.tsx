// src/components/CreateBundleModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { saveBundleAction, updateBundleAction } from "app/actions/bundleActions";

type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

type Bundle = {
  id: string;
  name: string;
  items: BundleItem[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bundle?: Bundle | null;
};

export default function CreateBundleModal({ isOpen, onClose, bundle }: Props) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [selected, setSelected] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------- PREFILL ---------- */
  useEffect(() => {
    if (!isOpen) return;
    if (bundle) {
      setBundleName(bundle.name);
      setSelected(bundle.items);
    } else {
      setBundleName("");
      setSelected([]);
    }
    setSearchQuery("");
  }, [bundle, isOpen]);

  /* ---------- LOAD PRODUCTS ---------- */
  useEffect(() => {
    if (!isOpen) return;

    const loadProducts = async () => {
      try {
        const { products } = await sdk.store.product.list({
          limit: 200,
          fields:
            "id,title,thumbnail,variants.id,variants.title,variants.calculated_price",
        });
        setProducts(
          products.filter(
            (p): p is HttpTypes.StoreProduct =>
              Array.isArray(p.variants) && p.variants.length > 0
          )
        );
      } catch (err) {
        console.error(err);
        alert("Failed to load products.");
      }
    };

    loadProducts();
  }, [isOpen]);

  /* ---------- SEARCH ---------- */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.title?.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  /* ---------- ADD / UPDATE ---------- */
  const toggleItem = (product: HttpTypes.StoreProduct, variantId: string) => {
    setSelected((prev) => {
      const existing = prev.find((i) => i.variant_id === variantId);
      if (existing) {
        return prev.map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        { product_id: product.id, variant_id: variantId, quantity: 1 },
      ];
    });
  };

  const updateQty = (variantId: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  /* ---------- PRICE HELPERS ---------- */
  const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  /* ---------- SUBTOTAL ---------- */
  const bundleTotal = useMemo(() => {
    return selected.reduce((total, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const variant = product?.variants?.find((v) => v.id === item.variant_id);
      const amount = variant?.calculated_price?.calculated_amount ?? 0;
      return total + amount * item.quantity;
    }, 0);
  }, [selected, products]);

  const currencyCode =
    products[0]?.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ||
    "USD";

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!bundleName.trim()) {
      alert("Please enter a bundle name");
      return;
    }
    if (!selected.length) {
      alert("Add at least one product");
      return;
    }

    setLoading(true);
    try {
      const result = bundle
        ? await updateBundleAction(bundle.id, bundleName.trim(), selected)
        : await saveBundleAction(bundleName.trim(), selected);

      if (result.success) onClose();
      else alert(result.error || "Failed to save bundle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ---------- RENDER ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div className="w-full max-w-7xl rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-2xl font-bold">
            {bundle ? "Edit Bundle" : "Create Bundle"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* PRODUCTS */}
          <div className="flex-1 p-6 overflow-y-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="mb-5 w-full rounded-xl border px-4 py-3"
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product) => {
                const variant = product.variants![0];
                const amount = variant.calculated_price?.calculated_amount ?? 0;
                const isAdded = selected.some((i) => i.variant_id === variant.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleItem(product, variant.id)}
                    className={`cursor-pointer rounded-xl border-2 p-3 text-center ${
                      isAdded
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="mb-3 aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <p className="text-sm font-medium line-clamp-2">
                      {product.title}
                    </p>

                    <p className="mt-1 font-bold">{formatMoney(amount, currencyCode)}</p>

                    <span className="mt-2 inline-block rounded-full bg-black px-3 py-1 text-xs text-white">
                      {isAdded ? "Added" : "+ Add"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="w-full md:w-96 border-l bg-gray-50 p-6">
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name"
              className="mb-6 w-full rounded-xl border px-4 py-3"
            />

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selected.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                return (
                  <div
                    key={item.variant_id}
                    className="flex justify-between items-center bg-white p-4 rounded-xl shadow"
                  >
                    <span>{product?.title}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(item.variant_id, -1)}
                        className="w-8 h-8 bg-gray-200 rounded"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.variant_id, 1)}
                        className="w-8 h-8 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TOTAL */}
            <div className="mt-6 border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatMoney(bundleTotal, currencyCode)}</span>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !bundleName || !selected.length}
              className="mt-6 w-full bg-black text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
