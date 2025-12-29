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
  Package2,
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

const formatMoney = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

/* ---------- COMPONENT ---------- */

export default function MyBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundleTotals, setBundleTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  /* ---------- LOAD BUNDLES ---------- */

  const loadBundles = async () => {
    try {
      setLoading(true);
      const result = await getSavedBundlesAction();

      if (!result.success || !Array.isArray(result.bundles)) {
        setBundles([]);
        return;
      }

      setBundles(result.bundles);
      await calculateBundleTotals(result.bundles);
    } catch (err) {
      console.error("Failed to load bundles", err);
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  /* ---------- CALCULATE SUBTOTALS ---------- */

  const calculateBundleTotals = async (bundles: Bundle[]) => {
    try {
      const { products } = await sdk.store.product.list({
        limit: 300,
        fields: "id,variants.id,variants.calculated_price",
      });

      const totals: Record<string, number> = {};

      bundles.forEach((bundle) => {
        let total = 0;

        bundle.items.forEach((item) => {
          const product = products.find((p) =>
            p.variants?.some((v) => v.id === item.variant_id)
          );

          const variant = product?.variants?.find(
            (v) => v.id === item.variant_id
          );

          const amount =
            variant?.calculated_price?.calculated_amount ?? 0;

          total += amount * item.quantity;
        });

        totals[bundle.id] = total;
      });

      setBundleTotals(totals);
    } catch (err) {
      console.error("Failed to calculate bundle totals", err);
    }
  };

  /* ---------- ACTIONS ---------- */

  const handleAddToCart = async (bundle: Bundle) => {
    setIsAddingToCart(bundle.id);
    try {
      const result = await addBundleToCartAction(bundle.items);
      if (result.success) {
        window.location.href = "/cart";
      } else {
        alert(result.error || "Failed to load bundle");
      }
    } catch {
      alert("Unexpected error");
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleDelete = async (bundleId: string) => {
    if (!confirm("Delete this bundle?")) return;

    setIsDeleting(bundleId);
    try {
      const result = await deleteBundleAction(bundleId);
      if (result.success) {
        await loadBundles();
      } else {
        alert(result.error || "Failed to delete bundle");
      }
    } catch {
      alert("Unexpected error");
    } finally {
      setIsDeleting(null);
    }
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Bundles</h1>
            <p className="mt-2 text-gray-600">
              Quickly load saved bundles into your cart
            </p>
          </div>

          <button
            onClick={() => {
              setEditBundle(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-gray-800"
          >
            <Plus size={20} />
            Create Bundle
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-white shadow"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bundles.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-24 shadow">
            <Package size={72} className="text-gray-300" />
            <p className="mt-6 text-xl font-medium text-gray-700">
              No bundles yet
            </p>
            <p className="mt-2 text-gray-500">
              Create your first bundle to speed up ordering
            </p>
          </div>
        )}

        {/* Bundle Cards */}
        {!loading && bundles.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="rounded-2xl bg-white p-8 shadow-md transition hover:shadow-xl"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  {/* Info */}
                  <div className="flex items-start gap-5">
                    <div className="rounded-xl bg-gray-100 p-3">
                      <Package2 size={36} className="text-gray-500" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {bundle.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(bundle.created_at).toLocaleDateString()}
                        </span>

                        <span className="flex items-center gap-2">
                          <Package size={16} />
                          {bundle.items.length} items
                        </span>

                        {bundleTotals[bundle.id] !== undefined && (
                          <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                            Subtotal {formatMoney(bundleTotals[bundle.id])}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => handleAddToCart(bundle)}
                      disabled={isAddingToCart === bundle.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAddingToCart === bundle.id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <ShoppingCart size={20} />
                      )}
                      Load to Cart
                    </button>

                    <button
                      onClick={() => {
                        setEditBundle(bundle);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-4 font-medium text-gray-800 transition hover:bg-gray-300"
                    >
                      <Pencil size={20} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(bundle.id)}
                      disabled={isDeleting === bundle.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-6 py-4 font-medium text-red-600 transition hover:bg-red-200 disabled:opacity-50"
                    >
                      {isDeleting === bundle.id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateBundleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditBundle(null);
          loadBundles();
        }}
        bundle={editBundle}
      />
    </div>
  );
}
