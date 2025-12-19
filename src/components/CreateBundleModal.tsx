"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import { getPricesForVariant } from "@lib/util/get-product-price";
import { saveBundleAction } from "app/actions/bundleActions";

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
  const [bundleName, setBundleName] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Load products when modal opens
   */
  useEffect(() => {
    if (!isOpen) {
      setSelected([]);
      setBundleName("");
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

  /**
   * Add / increment bundle item
   */
  const toggleItem = (product: HttpTypes.StoreProduct, variantId: string) => {
    setSelected((prev) => {
      const existing = prev.find((i) => i.variant_id === variantId);
      if (existing) {
        return prev.map((i) =>
          i.variant_id === variantId ? { ...i, quantity: i.quantity + 1 } : i
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

  /**
   * Update quantity
   */
  const updateQty = (variantId: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((i) =>
          i.variant_id === variantId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  /**
   * Save bundle
   */
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
      alert("Bundle saved successfully!");
      onClose();
    } else {
      alert(result.error || "Failed to save bundle");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-4 sm:px-8 sm:py-5">
          <h2 className="text-2xl font-bold sm:text-3xl">Create Bundle</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200 sm:p-3"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>
        <div className="flex h-full max-h-[calc(92vh-64px)] flex-col md:flex-row">
          {/* Products */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <h3 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
              Choose Products ({products.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const variant = product.variants![0];
                const price = getPricesForVariant(variant);
                const isAdded = selected.some((i) => i.variant_id === variant.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleItem(product, variant.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition sm:p-5 ${
                      isAdded
                        ? "border-purple-600 bg-white"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="mx-auto mb-3 h-32 w-full rounded-lg object-cover sm:mb-4 sm:h-40"
                      />
                    ) : (
                      <div className="mx-auto mb-3 h-32 rounded-lg bg-gray-200 sm:mb-4 sm:h-40" />
                    )}
                    <p className="line-clamp-2 text-sm font-medium sm:text-base">
                      {product.title}
                    </p>
                    {price && (
                      <p className="mt-1 text-base font-bold text-black sm:mt-2 sm:text-lg">
                        {price.calculated_price}
                      </p>
                    )}
                    <span
                      className={`mt-3 inline-block rounded-full px-4 py-1 text-xs font-bold sm:mt-4 sm:px-6 sm:py-2 sm:text-sm ${
                        isAdded ? "bg-black text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isAdded ? "Added" : "+ Add"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Preview */}
          <div className="w-full border-t bg-gray-50 p-4 sm:p-8 md:w-96 md:border-l md:border-t-0">
            <h3 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">Bundle Preview</h3>
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="e.g. Monthly Cleaning Kit"
              className="w-full rounded-xl border px-4 py-3 text-base sm:px-5 sm:py-4 sm:text-lg"
            />
            <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
              {selected.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                return (
                  <div
                    key={item.variant_id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow sm:p-5"
                  >
                    <span className="text-sm font-medium sm:text-base">{product?.title}</span>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => updateQty(item.variant_id, -1)}
                        className="h-8 w-8 rounded-lg bg-gray-200 text-base sm:h-9 sm:w-9"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-base sm:w-10 sm:text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.variant_id, 1)}
                        className="h-8 w-8 rounded-lg bg-gray-200 text-base sm:h-9 sm:w-9"
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
              className="mt-6 w-full rounded-xl bg-black py-4 text-lg font-bold text-white disabled:opacity-50 sm:mt-10 sm:py-5 sm:text-xl"
            >
              {loading ? "Saving..." : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}