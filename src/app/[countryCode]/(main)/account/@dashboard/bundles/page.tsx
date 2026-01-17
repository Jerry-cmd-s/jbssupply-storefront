"use client";

import { useEffect, useState } from "react";
import { sdk } from "@lib/config";
import CreateBundleModal from "components/CreateBundleModal";
import {
  getSavedBundlesAction,
  addBundleToCartAction,
  deleteBundleAction,
} from "app/actions/bundleActions";
import {
  Package,
  Plus,
  Loader2,
  ShoppingCart,
  Pencil,
  Calendar,
  Trash2,
} from "lucide-react";

/* =====================
   Types
===================== */

type BundleItem = {
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
  created_at: string;
  items: BundleItem[];
  delivery_schedule: DeliverySchedule;
};

/* =====================
   Helpers
===================== */

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

/**
 * Calculate next delivery date based on:
 * - every X months
 * - day of month (1–28)
 * - start date
 */
const getNextDeliveryDate = (
  schedule: DeliverySchedule
): Date | null => {
  if (!schedule) return null;

  const { interval_count, day_of_month, start_date } = schedule;

  const start = new Date(start_date);
  if (isNaN(start.getTime())) return null;

  const today = new Date();
  let current = new Date(start);

  // Normalize day
  current.setDate(
    Math.min(day_of_month, 28)
  );

  while (current < today) {
    current.setMonth(current.getMonth() + interval_count);
  }

  return isNaN(current.getTime()) ? null : current;
};

/* =====================
   Component
===================== */

export default function MyBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundleTotals, setBundleTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [busyBundleId, setBusyBundleId] = useState<string | null>(null);

  /* =====================
     Load Bundles
  ===================== */

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const res = await getSavedBundlesAction();

      if (!res.success || !Array.isArray(res.bundles)) {
        setBundles([]);
        return;
      }

      setBundles(res.bundles);
      calculateTotals(res.bundles);
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     Calculate Totals
  ===================== */

  const calculateTotals = async (bundles: Bundle[]) => {
    try {
      const { products } = await sdk.store.product.list({
        limit: 300,
        fields: "id,variants.id,variants.calculated_price",
      });

      const totals: Record<string, number> = {};

      for (const bundle of bundles) {
        totals[bundle.id] = bundle.items.reduce((sum, item) => {
          const product = products.find((p) =>
            p.variants?.some((v) => v.id === item.variant_id)
          );

          const variant = product?.variants?.find(
            (v) => v.id === item.variant_id
          );

          const price =
            variant?.calculated_price?.calculated_amount ?? 0;

          return sum + price * item.quantity;
        }, 0);
      }

      setBundleTotals(totals);
    } catch {
      // non-critical UI
    }
  };

  /* =====================
     Actions
  ===================== */

  const handleAddToCart = async (bundle: Bundle) => {
    setBusyBundleId(bundle.id);
    try {
      const res = await addBundleToCartAction(bundle.items);
      if (res.success) window.location.href = "/cart";
    } finally {
      setBusyBundleId(null);
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm("Delete this bundle?")) return;

    setBusyBundleId(bundleId);
    try {
      await deleteBundleAction(bundleId);
      await loadBundles();
    } finally {
      setBusyBundleId(null);
    }
  };

  /* =====================
     UI
  ===================== */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              My Bundles
            </h1>
            <p className="text-sm text-gray-500">
              Automated monthly bundle deliveries
            </p>
          </div>

          <button
            onClick={() => {
              setEditingBundle(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            New Bundle
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-white"
              />
            ))}
          </div>
        )}

        {/* Bundles */}
        {!loading &&
          bundles.map((bundle) => {
            const nextDelivery = getNextDeliveryDate(
              bundle.delivery_schedule
            );

            return (
              <div
                key={bundle.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {bundle.name}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        Next delivery:&nbsp;
                        {nextDelivery
                          ? nextDelivery.toLocaleDateString()
                          : "Not scheduled"}
                      </span>

                      <span className="flex items-center gap-1">
                        <Package size={16} />
                        {bundle.items.length} items
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        Every {bundle.delivery_schedule.interval_count} month
                        {bundle.delivery_schedule.interval_count > 1
                          ? "s"
                          : ""}{" "}
                        • Day {bundle.delivery_schedule.day_of_month}
                      </span>

                      {bundleTotals[bundle.id] !== undefined && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          {formatMoney(bundleTotals[bundle.id])}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(bundle)}
                      disabled={busyBundleId === bundle.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {busyBundleId === bundle.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                      Cart
                    </button>

                    <button
                      onClick={() => {
                        setEditingBundle(bundle);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-4 py-2 text-sm"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteBundle(bundle.id)}
                      disabled={busyBundleId === bundle.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        <CreateBundleModal
          isOpen={isModalOpen}
          bundle={editingBundle}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBundle(null);
            loadBundles();
          }}
        />
      </div>
    </div>
  );
}
