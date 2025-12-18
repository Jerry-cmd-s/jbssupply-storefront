"use client";

import { useEffect, useState } from "react";
import { sdk } from "@lib/config";
import CreateBundleModal from "components/CreateBundleModal";
import { getSavedBundlesAction, addBundleToCartAction } from "app/actions/bundleActions";
import { Package, Plus, Loader2, ShoppingCart, Pencil, Trash2 } from "lucide-react"; // Add lucide-react for icons (npm i lucide-react)

/* ----------------------------- Types ----------------------------- */
type Bundle = {
  id: string;
  name: string;
  created_at: string;
  items: { quantity: number; variant_id: string }[]; // Enhanced type assuming BundleItem has variant_id
};

/* ----------------------------- Component ----------------------------- */
export default function MyBundlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null); // Track loading per bundle

  /* ----------------------------- Data Loading ----------------------------- */
  const loadBundles = async () => {
    try {
      setLoading(true);
      const result = await getSavedBundlesAction();
      if (result.success) {
        setBundles(Array.isArray(result.bundles) ? result.bundles : []);
      } else {
        console.error("Failed to load bundles");
        setBundles([]);
      }
    } catch (error) {
      console.error("Failed to load bundles", error);
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundles();
  }, []);

  const handleAddToCart = async (bundle: Bundle) => {
    setIsAddingToCart(bundle.id);
    try {
      const result = await addBundleToCartAction(bundle.items);
      if (result.success) {
        alert("Your bundle is ready in the cart!"); // Replace with toast in production
        window.location.href = "/cart";
      } else {
        alert(result.error || "Failed to load bundle");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsAddingToCart(null);
    }
  };

  /* ----------------------------- UI ----------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Bundles</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-gray-800 sm:px-8 sm:py-4 sm:text-lg"
          >
            <Plus size={20} />
            Create New Bundle
          </button>
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white shadow-lg"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bundles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={80} className="mb-6 text-gray-300" strokeWidth={1.5} />
            <p className="text-xl font-medium text-gray-600 sm:text-2xl">No bundles yet</p>
            <p className="mt-2 text-base text-gray-500 sm:text-lg">
              Create your first custom bundle using the button above.
            </p>
          </div>
        )}

        {/* Bundles Grid */}
        {!loading && bundles.length > 0 && (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl sm:p-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-800 sm:text-2xl">{bundle.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Created {new Date(bundle.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-4 text-base font-semibold text-gray-700 sm:mt-6 sm:text-lg">
                    {bundle.items.length} {bundle.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="mt-6 space-y-3 sm:mt-8">
                  <button
                    onClick={() => handleAddToCart(bundle)}
                    disabled={!!isAddingToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                  >
                    {isAddingToCart === bundle.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    Load Bundle & Go to Cart
                  </button>
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 opacity-60 sm:text-base"
                  >
                    <Pencil size={18} />
                    Edit (coming soon)
                  </button>
                  {/* Optional: Add delete if you implement a delete action */}
                  {/* <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 sm:text-base">
                    <Trash2 size={18} />
                    Delete
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Bundle Modal */}
      <CreateBundleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadBundles(); // Refresh after saving
        }}
      />
    </div>
  );
}