'use client';

import { useState, useEffect } from 'react';
import CreateBundleModal from '@/components/CreateBundleModal';
import { getSavedBundles } from '@/lib/util/bundleUtils';
import { medusaClient } from '@/lib/medusa'; // ← change only if your client file is named differently

export default function MyBundlesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [bundles, setBundles] = useState<any[]>([]);

  const loadBundles = async () => {
    try {
      const data = await getSavedBundles(medusaClient);
      setBundles(data);
    } catch (err) {
      console.error('Failed to load bundles', err);
      setBundles([]);
    }
  };

  // Load bundles when page opens
  useEffect(() => {
    loadBundles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">My Bundles</h1>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition"
          >
            + Create New Bundle
          </button>
        </div>

        {/* Empty State */}
        {bundles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8" />
            <p className="text-2xl font-medium text-gray-600">No bundles yet</p>
            <p className="text-gray-500 mt-3">Create your first custom bundle with the button above!</p>
          </div>
        ) : (
          /* Saved Bundles Grid */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition"
              >
                <h3 className="text-2xl font-bold text-gray-800">{bundle.name}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(bundle.created_at).toLocaleDateString()}
                </p>
                <p className="text-lg font-semibold text-gray-700 mt-6">
                  {bundle.items.length} {bundle.items.length === 1 ? 'item' : 'items'}
                </p>

                {/* Future buttons */}
                <div className="mt-8 space-y-3">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                  <button className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <CreateBundleModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          loadBundles(); // refresh the list after saving
        }}
        sdk={medusaClient}
      />
    </div>
  );
}