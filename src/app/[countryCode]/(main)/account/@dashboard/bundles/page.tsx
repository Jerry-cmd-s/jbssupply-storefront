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

/* ---------- TYPES ---------- */

type BundleItem = {
  quantity: number;
  variant_id: string;
};

type Bundle = {
  id: string;
  name: string;
  created_at: string;
  items: BundleItem[];
};

/* ---------- HELPERS ---------- */

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

/* ---------- COMPONENT ---------- */

export default function MyBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundleTotals, setBundleTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  /* ---------- LOAD ---------- */

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const result = await getSavedBundlesAction();
      if (!result.success || !Array.isArray(result.bundles)) {
        setBundles([]);
        return;
      }

      setBundles(result.bundles);
      calculateTotals(result.bundles);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- TOTALS ---------- */

  const calculateTotals = async (bundles: Bundle[]) => {
    try {
      const { products } = await sdk.store.product.list({
        limit: 300,
        fields: "id,variants.id,variants.calculated_price",
      });

      const totals: Record<string, number> = {};

      bundles.forEach((bundle) => {
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
      });

      setBundleTotals(totals);
    } catch {}
  };

  /* ---------- ACTIONS ---------- */

  const addToCart = async (bundle: Bundle) => {
    setBusyId(bundle.id);
    try {
      const res = await addBundleToCartAction(bundle.items);
      if (res.success) window.location.href = "/cart";
    } finally {
      setBusyId(null);
    }
  };

  const deleteBundle = async (id: string) => {
    if (!confirm("Delete this bundle?")) return;
    setBusyId(id);
    try {
      await deleteBundleAction(id);
      await loadBundles();
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- UI ---------- */

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
              Reuse saved bundles to order faster
            </p>
          </div>

          <button
            onClick={() => {
              setEditBundle(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-base font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            New Bundle
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-white"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && bundles.length === 0 && (
          <div className="rounded-xl bg-white p-16 text-center">
            <Package className="mx-auto mb-4 text-gray-300" size={52} />
            <p className="font-medium text-gray-700">
              No bundles created yet
            </p>
            <p className="text-sm text-gray-500">
              Create one to speed up ordering
            </p>
          </div>
        )}

        {/* Bundles */}
        {!loading &&
          bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bundle.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(bundle.created_at).toLocaleDateString()}
                    </span>

                    <span className="flex items-center gap-1">
                      <Package size={16} />
                      {bundle.items.length} items
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
                    onClick={() => addToCart(bundle)}
                    disabled={busyId === bundle.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busyId === bundle.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                    Cart
                  </button>

                  <button
                    onClick={() => {
                      setEditBundle(bundle);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteBundle(bundle.id)}
                    disabled={busyId === bundle.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* Modal */}
        <CreateBundleModal
          isOpen={isModalOpen}
          bundle={editBundle}
          onClose={() => {
            setIsModalOpen(false);
            setEditBundle(null);
            loadBundles();
          }}
        />
      </div>
    </div>
  );
}
