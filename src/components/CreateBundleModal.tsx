"use client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { HttpTypes } from "@medusajs/types";
import { sdk } from "@lib/config";
import {
  saveBundleAction,
  updateBundleAction,
} from "app/actions/bundleActions";

type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

type DeliverySchedule = {
  interval_type: "days" | "weeks" | "months";
  interval_count: number;
  day_of_month?: number; // for monthly
  weekday?: number; // for weekly
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

export default function CreateBundleModal({
  isOpen,
  onClose,
  bundle,
}: Props) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<BundleItem[]>([]);
  const [bundleName, setBundleName] = useState("");

  // New state for flexible delivery
  const [intervalType, setIntervalType] = useState<DeliverySchedule["interval_type"]>("months");
  const [intervalCount, setIntervalCount] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [weekday, setWeekday] = useState(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- PREFILL ON OPEN ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (bundle) {
      setBundleName(bundle.name);
      setSelectedItems(bundle.items);
      const schedule = bundle.delivery_schedule;
      setIntervalType(schedule.interval_type);
      setIntervalCount(schedule.interval_count);
      setDayOfMonth(schedule.day_of_month ?? 1);
      setWeekday(schedule.weekday ?? 1);
      setStartDate(schedule.start_date);
    } else {
      setBundleName("");
      setSelectedItems([]);
      setIntervalType("months");
      setIntervalCount(1);
      setDayOfMonth(1);
      setWeekday(1);
      setStartDate(new Date().toISOString().slice(0, 10));
    }

    setSearchQuery("");
  }, [isOpen, bundle]);

  /* ---------- LOAD PRODUCTS ---------- */
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

  /* ---------- ADD / UPDATE ITEMS ---------- */
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

  /* ---------- MONEY ---------- */
  const formatMoney = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  /* ---------- TOTAL ---------- */
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

  /* ---------- SAVE ---------- */
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
        interval_type: intervalType,
        interval_count: intervalCount,
        start_date: startDate,
      };
      if (intervalType === "months") delivery_schedule.day_of_month = dayOfMonth;
      if (intervalType === "weeks") delivery_schedule.weekday = weekday;

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

  /* ---------- RENDER ---------- */
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="w-full h-[95vh] sm:h-auto sm:max-w-7xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">
            {bundle ? "Edit Bundle" : "Create Bundle"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* PRODUCT LIST */}
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
          {/* BUNDLE SUMMARY */}
          <div className="bg-gray-50 border-l px-6 py-4 w-full sm:w-96 overflow-y-auto">
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name"
              className="w-full mb-4 rounded-xl border px-4 py-3"
            />

            {/* Flexible Delivery */}
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-semibold mb-1">
                Delivery schedule
              </label>

              <select
                value={intervalType}
                onChange={(e) => setIntervalType(e.target.value as any)}
                className="w-full rounded-xl border px-4 py-3 bg-white"
              >
                <option value="days">Every X days</option>
                <option value="weeks">Every X weeks</option>
                <option value="months">Every X months</option>
              </select>

              <input
                type="number"
                min={1}
                value={intervalCount}
                onChange={(e) => setIntervalCount(Number(e.target.value))}
                className="w-full rounded-xl border px-4 py-3 bg-white"
                placeholder="Interval count"
              />

              <label className="block text-xs text-gray-500">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 bg-white"
              />

              {intervalType === "months" && (
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
              )}

              {intervalType === "weeks" && (
                <select
                  value={weekday}
                  onChange={(e) => setWeekday(Number(e.target.value))}
                  className="w-full rounded-xl border px-4 py-3 bg-white"
                >
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day, idx) => (
                    <option key={idx} value={idx+1}>{day}</option>
                  ))}
                </select>
              )}
            </div>

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
              <span>
                {formatMoney(bundleTotal, currencyCode)}
              </span>
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
