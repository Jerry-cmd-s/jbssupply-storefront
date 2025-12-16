// src/app/[countryCode]/(main)/account/@dashboard/bundles/page.tsx
"use client";

import { useEffect, useState } from "react";
import { sdk } from "@lib/config";
import CreateBundleModal from "components/CreateBundleModal";
import { getSavedBundlesAction } from "app/actions/bundleActions"; // <-- new import
import { addBundleToCartAction } from 'app/actions/bundleActions';
/* ----------------------------- Types ----------------------------- */
type Bundle = {
  id: string;
  name: string;
  created_at: string;
  items: { quantity: number }[];
};

/* ----------------------------- Component ----------------------------- */
export default function MyBundlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------- Data Loading ----------------------------- */
  const loadBundles = async () => {
  try {
    setLoading(true);
    const result = await getSavedBundlesAction(); // <-- server action call

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

  /* ----------------------------- UI ----------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold text-gray-900">My Bundles</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-black px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-red-800"
          >
            + Create New Bundle
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-500">
            Loading bundles…
          </div>
        )}

        {/* Empty State */}
        {!loading && bundles.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-8 h-32 w-32 rounded-xl border-2 border-dashed bg-gray-200" />
            <p className="text-2xl font-medium text-gray-600">No bundles yet</p>
            <p className="mt-3 text-gray-500">
              Create your first custom bundle using the button above.
            </p>
          </div>
        )}

        {/* Bundles Grid */}
        {!loading && bundles.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl"
              >
                <h3 className="text-2xl font-bold text-gray-800">
                  {bundle.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Created {new Date(bundle.created_at).toLocaleDateString()}
                </p>
                <p className="mt-6 text-lg font-semibold text-gray-700">
                  {bundle.items.length}{" "}
                  {bundle.items.length === 1 ? "item" : "items"}
                </p>
                <div className="mt-8 space-y-3">
                 <button
  onClick={async () => {
    const result = await addBundleToCartAction(bundle.items);
    if (result.success) {
      alert("Your bundle is ready in the cart!");
      window.location.href = "/cart"; // Takes them to cart with clean bundle
    } else {
      alert(result.error || "Failed to load bundle");
    }
  }}
  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 transition"
>
  Load My Bundle & Go to Cart
</button>
                  <button
                    disabled
                    className="w-full rounded-lg border border-gray-300 py-3 opacity-60"
                  >
                    Edit (coming soon)
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
          loadBundles(); // Refresh the list after saving
        }}
       // sdk={sdk}
      />
    </div>
  );
}