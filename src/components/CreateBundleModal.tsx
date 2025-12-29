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

export default function CreateBundleModal({
  isOpen,
  onClose,
  bundle,
}: Props) {
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
      } catch (error) {
        console.error(error);
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
        p.variants?.some((v) =>
          v.title?.toLowerCase().includes(q)
        )
    );
  }, [products, searchQuery]);

  /* ---------- ADD / UPDATE ---------- */
  const toggleItem = (
    product: HttpTypes.StoreProduct,
    variantId: string
  ) => {
    setSelected((prev) => {
      const existing = prev.find(
        (i) => i.variant_id === variantId
      );

      if (existing) {
        return prev.map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          variant_id: variantId,
          quantity: 1,
        },
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

  /* ---------- MONEY ---------- */
  const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  /* ---------- TOTAL ---------- */
  const bundleTotal = useMemo(() => {
    return selected.reduce((total, item) => {
      const product = products.find(
        (p) => p.id === item.product_id
      );
      const variant = product?.variants?.find(
        (v) => v.id === item.variant_id
      );

      const amount =
        variant?.calculated_price?.calculated_amount ?? 0;

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
        ? await updateBundleAction(
            bundle.id,
            bundleName.trim(),
            selected
          )
        : await saveBundleAction(
            bundleName.trim(),
            selected
          );

      if (result.success) onClose();
      else alert(result.error || "Failed to save bundle");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ---------- RENDER ---------- */
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="w-full h-[95vh] sm:h-auto sm:max-w-7xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
          <h2 className="text-lg sm:text-2xl font-bold">
            {bundle ? "Edit Bundle" : "Create Bundle"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* PRODUCTS */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full mb-4 rounded-xl border px-4 py-3 text-base"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const variant = product.variants![0];
                const amount =
                  variant.calculated_price?.calculated_amount ?? 0;

                const isAdded = selected.some(
                  (i) => i.variant_id === variant.id
                );

                return (
                  <button
                    key={product.id}
                    onClick={() =>
                      toggleItem(product, variant.id)
                    }
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      isAdded
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="mb-2 aspect-square bg-gray-100 rounded-xl overflow-hidden">
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

                    <p className="mt-1 text-sm font-bold">
                      {formatMoney(amount, currencyCode)}
                    </p>

                    <span className="mt-2 inline-block text-xs font-semibold">
                      {isAdded ? "Added" : "+ Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="border-t sm:border-t-0 sm:border-l bg-gray-50 px-4 sm:px-6 py-4 w-full sm:w-96 overflow-y-auto">
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name"
              className="w-full mb-4 rounded-xl border px-4 py-3 text-base"
            />

            <div className="space-y-3 max-h-64 sm:max-h-none overflow-y-auto">
              {selected.map((item) => {
                const product = products.find(
                  (p) => p.id === item.product_id
                );

                return (
                  <div
                    key={item.variant_id}
                    className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm"
                  >
                    <span className="text-sm font-medium">
                      {product?.title}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQty(item.variant_id, -1)
                        }
                        className="w-9 h-9 rounded-lg bg-gray-200 text-lg"
                      >
                        −
                      </button>

                      <span className="min-w-[20px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQty(item.variant_id, 1)
                        }
                        className="w-9 h-9 rounded-lg bg-gray-200 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between font-bold">
              <span>Total</span>
              <span>
                {formatMoney(bundleTotal, currencyCode)}
              </span>
            </div>

            <button
              onClick={handleSave}
              disabled={
                loading || !bundleName || !selected.length
              }
              className="mt-4 w-full rounded-xl bg-black py-4 text-white font-bold disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
