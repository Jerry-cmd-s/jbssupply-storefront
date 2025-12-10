"use client"

import { useEffect, useState } from "react"
import { sdk } from "@lib/config"                    // This is what your project uses
import { getSavedBundles } from "@lib/util/bundleUtils"
import CreateBundleModal from "components/CreateBundleModal"

/* ----------------------------- Types ----------------------------- */
type Bundle = {
  id: string
  name: string
  created_at: string
  items: { quantity: number }[]
}

/* ----------------------------- Component ----------------------------- */
export default function MyBundlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  /* ----------------------------- Data Loading ----------------------------- */
  const loadBundles = async () => {
    try {
      setLoading(true)
      // Pass the sdk instance (same shape as old medusaClient)
      const data = await getSavedBundles(sdk)
      setBundles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load bundles", error)
      setBundles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBundles()
  }, [])

  /* ----------------------------- UI ----------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold text-gray-900">My Bundles</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-purple-700"
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
                    disabled
                    className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white opacity-60"
                  >
                    Add to Cart (coming soon)
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
          setIsModalOpen(false)
          loadBundles() // refresh list after creating/updating
        }}
        sdk={sdk} // pass the same sdk instance the rest of the app uses
      />
    </div>
  )
}