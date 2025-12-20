"use client";

import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getPricesForVariant } from "@lib/util/get-product-price";
import { saveBundleAction } from "app/actions/bundleActions";

/* ---------------- TYPES ---------------- */

type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/* ---------------- COMPONENT ---------------- */

export default function CreateBundleModal({ isOpen, onClose }: Props) {
  /* ---------- STATE ---------- */
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [selected, setSelected] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------- LOAD PRODUCTS ---------- */
  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setBundleName("");
      setSearchQuery("");
      return;
    }

    const fetchProducts = async () => {
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
        console.error("Failed to load products", err);
        alert("Failed to load products. Please refresh.");
      }
    };

    fetchProducts();
  }, [isOpen]);

  /* ---------- SEARCH (MEMOIZED) ---------- */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const q = searchQuery.toLowerCase();

    return products.filter((product) => {
      return (
        product.title.toLowerCase().includes(q) ||
        product.variants?.some((v) =>
          v.title?.toLowerCase().includes(q)
        )
      );
    });
  }, [products, searchQuery]);

  /* ---------- ADD / INCREMENT ---------- */
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
        {
          product_id: product.id,
          variant_id: variantId,
          quantity: 1,
        },
      ];
    });
  };

  /* ---------- UPDATE QTY ---------- */
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

  /* ---------- SAVE BUNDLE ---------- */
  const handleSave = async () => {
    if (!bundleName.trim()) {
      alert("Please enter a bundle name");
      return;
    }

    if (selected.length === 0) {
      alert("Add at least one product");
      return;
    }

    setLoading(true);
    const result = await saveBundleAction(bundleName.trim(), selected);
    setLoading(false);

    if (result.success) {
      alert("Bundle saved successfully");
      onClose();
    } else {
      alert(result.error || "Failed to save bundle");
    }
  };

  if (!isOpen) return null;

  /* ---------- RENDER ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <h2 className="text-2xl font-bold">Create Bundle</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full max-h-[calc(92vh-72px)] flex-col md:flex-row">
          {/* PRODUCT GRID */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="mb-5 text-lg font-semibold">
              Choose Products ({filteredProducts.length})
            </h3>

            {/* SEARCH */}
            <div className="mb-5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or variant…"
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product) => {
                const variant = product.variants![0];
                const price = getPricesForVariant(variant);
                const isAdded = selected.some(
                  (i) => i.variant_id === variant.id
                );

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleItem(product, variant.id)}
                    className={`cursor-pointer rounded-xl border-2 p-3 text-center transition ${
                      isAdded
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {/* SQUARE IMAGE */}
                    <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm font-medium">
                      {product.title}
                    </p>

                    {price && (
                      <p className="mt-1 text-base font-bold">
                        {price.calculated_price}
                      </p>
                    )}

                    <span
                      className={`mt-3 inline-block rounded-full px-4 py-1 text-xs font-bold ${
                        isAdded
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isAdded ? "Added" : "+ Add"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="w-full border-t bg-gray-50 p-6 md:w-96 md:border-l md:border-t-0">
            <h3 className="mb-4 text-lg font-semibold">Bundle Preview</h3>

            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="e.g. Monthly Cleaning Kit"
              className="w-full rounded-xl border px-4 py-3 text-base"
            />

            <div className="mt-6 space-y-3">
              {selected.map((item) => {
                const product = products.find(
                  (p) => p.id === item.product_id
                );

                return (
                  <div
                    key={item.variant_id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow"
                  >
                    <span className="text-sm font-medium">
                      {product?.title}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(item.variant_id, -1)}
                        className="h-8 w-8 rounded-lg bg-gray-200"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.variant_id, 1)}
                        className="h-8 w-8 rounded-lg bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !bundleName.trim() || selected.length === 0}
              className="mt-6 w-full rounded-xl bg-black py-4 text-lg font-bold text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
