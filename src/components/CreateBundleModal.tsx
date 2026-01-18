"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import {
  saveBundleAction,
  updateBundleAction,
} from "app/actions/bundleActions";

/* =====================
   Types
===================== */

type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

type DeliverySchedule = {
  interval_type: "months";
  interval_count: number;
  day_of_month: number;
  start_date: string;
};

type Bundle = {
  id: string;
  name: string;
  items: BundleItem[];
  delivery_schedule: DeliverySchedule;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bundle?: Bundle | null;
};

/* =====================
   Component
===================== */

export default function CreateBundleModal({
  isOpen,
  onClose,
  bundle,
}: Props) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState("");

  /* Delivery Schedule (Monthly Only) */
  const [intervalCount, setIntervalCount] = useState(1); // every X months
  const [dayOfMonth, setDayOfMonth] = useState(1); // day in month
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================
     Prefill on Open
  ===================== */

  useEffect(() => {
    if (!isOpen) return;

    if (bundle) {
      setBundleName(bundle.name);
      setSelectedItems(bundle.items);

      const schedule = bundle.delivery_schedule;
      setIntervalCount(schedule.interval_count);
      setDayOfMonth(schedule.day_of_month);
      setStartDate(schedule.start_date);
    } else {
      setBundleName("");
      setSelectedItems([]);
      setIntervalCount(1);
      setDayOfMonth(1);
      setStartDate(new Date().toISOString().slice(0, 10));
    }

    setSearchQuery("");
  }, [isOpen, bundle]);

  /* =====================
     Load Products
  ===================== */

  useEffect(() => {
    if (!isOpen) return;

    const loadProducts = async () => {
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
    };

    loadProducts().catch(() =>
      alert("Failed to load products. Please try again.")
    );
  }, [isOpen]);

  /* =====================
     Search
  ===================== */

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.title?.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  /* =====================
     Item Management
  ===================== */

  const addItem = (product: HttpTypes.StoreProduct, variantId: string) => {
    setSelectedItems((prev) => {
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

  const updateQuantity = (variantId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  /* =====================
     Pricing
  ===================== */

  const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  const bundleTotal = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const variant = product?.variants?.find(
        (v) => v.id === item.variant_id
      );
      const price = variant?.calculated_price?.calculated_amount ?? 0;
      return total + price * item.quantity;
    }, 0);
  }, [selectedItems, products]);

  const currencyCode =
    products[0]?.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ??
    "USD";

  /* =====================
     Save Bundle
  ===================== */

  const handleSave = async () => {
    if (!bundleName.trim()) {
      alert("Please enter a bundle name.");
      return;
    }

    if (!selectedItems.length) {
      alert("Please add at least one product.");
      return;
    }

    setLoading(true);

    try {
      const delivery_schedule: DeliverySchedule = {
        interval_type: "months",
        interval_count: intervalCount,
        day_of_month: dayOfMonth,
        start_date: startDate,
      };

      const result = bundle
        ? await updateBundleAction(
            bundle.id,
            bundleName.trim(),
            selectedItems,
            delivery_schedule
          )
        : await saveBundleAction(
            bundleName.trim(),
            selectedItems,
            delivery_schedule
          );

      if (result.success) onClose();
      else alert(result.error || "Failed to save bundle.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* =====================
     Render
  ===================== */

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="w-full h-[95vh] sm:h-auto sm:max-w-7xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">
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
          {/* Products */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full mb-4 rounded-xl border px-4 py-3"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const variant = product.variants![0];
                const price =
                  variant.calculated_price?.calculated_amount ?? 0;
                const isSelected = selectedItems.some(
                  (i) => i.variant_id === variant.id
                );

                return (
                  <button
                    key={product.id}
                    onClick={() => addItem(product, variant.id)}
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      isSelected
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
                      {formatMoney(price, currencyCode)}
                    </p>
                    <span className="mt-2 inline-block text-xs font-semibold">
                      {isSelected ? "Added" : "+ Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border-l px-6 py-4 w-full sm:w-96 overflow-y-auto">
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name"
              className="w-full mb-4 rounded-xl border px-4 py-3"
            />

            {/* Delivery Schedule */}
            <div className="mb-4 space-y-3">
              <label className="block text-sm font-semibold">
                Delivery schedule
              </label>

              <select
                value={intervalCount}
                onChange={(e) => setIntervalCount(Number(e.target.value))}
                className="w-full rounded-xl border px-4 py-3 bg-white"
              >
                {[1, 2, 3, 4, 6, 12].map((m) => (
                  <option key={m} value={m}>
                    Every {m} month{m > 1 ? "s" : ""}
                  </option>
                ))}
              </select>

              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full rounded-xl border px-4 py-3 bg-white"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                    {day === 1
                      ? "st"
                      : day === 2
                      ? "nd"
                      : day === 3
                      ? "rd"
                      : "th"}{" "}
                    of the month
                  </option>
                ))}
              </select>


          <div className="mb-4 space-y-3">
  <label className="block text-sm font-medium text-gray-700">
    Pick the date your deliveries should begin
  </label>

  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="w-full rounded-xl border px-4 py-3 bg-white"
  />
</div>




            </div>

            {/* Selected Items */}
            <div className="space-y-3">
              {selectedItems.map((item) => {
                const product = products.find(
                  (p) => p.id === item.product_id
                );

                return (
                  <div
                    key={item.variant_id}
                    className="flex justify-between items-center bg-white p-3 rounded-xl"
                  >
                    <span className="text-sm font-medium">
                      {product?.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.variant_id, -1)
                        }
                        className="w-8 h-8 rounded bg-gray-200"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variant_id, 1)
                        }
                        className="w-8 h-8 rounded bg-gray-200"
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
              <span>{formatMoney(bundleTotal, currencyCode)}</span>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
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
