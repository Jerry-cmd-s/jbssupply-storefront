"use client";

import { useEffect, useState } from "react";
import { sdk } from "@lib/config";
import CreateBundleModal from "components/CreateBundleModal";
import { getSavedBundlesAction, addBundleToCartAction, updateBundleAction, deleteBundleAction } from "app/actions/bundleActions";
import { Package, Plus, Loader2, ShoppingCart, Pencil, Calendar, Package2, Trash2 } from "lucide-react";

type Bundle = {
  id: string;
  name: string;
  created_at: string;
  items: { quantity: number; variant_id: string }[];
};

export default function MyBundlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
        alert("Your bundle is ready in the cart!");
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

  const handleDelete = async (bundleId: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    setIsDeleting(bundleId);
    try {
      const result = await deleteBundleAction(bundleId);
      if (result.success) {
        alert("Bundle deleted successfully!");
        await loadBundles(); // Refresh list
      } else {
        alert(result.error || "Failed to delete bundle");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Bundles</h1>
          <button
            onClick={() => {
              setEditBundle(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-gray-800 sm:px-8 sm:py-4 sm:text-lg"
          >
            <Plus size={20} />
            Create New Bundle
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white shadow-md"></div>
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

        {/* Horizontal Bundle List */}
        {!loading && bundles.length > 0 && (
          <div className="space-y-6">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl sm:p-8 md:flex-row md:items-center md:justify-between md:gap-8"
              >
                {/* Left: Bundle Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:block">
                      <Package2 size={48} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {bundle.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-gray-600 sm:text-base">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} />
                          <span>Created {new Date(bundle.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package2 size={18} />
                          <span className="font-semibold text-gray-800">
                            {bundle.items.length} {bundle.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row">
                  <button
                    onClick={() => handleAddToCart(bundle)}
                    disabled={!!isAddingToCart || isDeleting === bundle.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingToCart === bundle.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={20} />
                    )}
                    Load Bundle & Go to Cart
                  </button>
                  <button
                    onClick={() => {
                      setEditBundle(bundle);
                      setIsModalOpen(true);
                    }}
                    disabled={isAddingToCart === bundle.id || isDeleting === bundle.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-4 text-base font-medium text-gray-800 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pencil size={20} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    disabled={isAddingToCart === bundle.id || isDeleting === bundle.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-100 px-6 py-4 text-base font-medium text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeleting === bundle.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                    Delete
                  </button>
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
          loadBundles();
        }}
        bundle={editBundle ?? undefined}
      />
    </div>
  );
}