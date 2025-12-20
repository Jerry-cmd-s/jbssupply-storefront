"use client";

import React, { useState } from "react";

export default function ProductRequestPage() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Request a Product
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Can’t find what you need? Tell us what your business uses and we’ll
            source it for you.
          </p>
        </div>

        {/* Info Panel */}
        <div className="mb-10 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            How this works
          </h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>You submit a product request with details</li>
            <li>Our sourcing team reviews availability and pricing</li>
            <li>If approved, we add it to your account or bundles</li>
            <li>You’ll be notified once it’s ready to order</li>
          </ul>
        </div>

        {/* Request Form */}
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Product Details
          </h2>

          <form className="space-y-6">
            {/* Business Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Business Name"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="text"
                placeholder="Contact Name"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="email"
                placeholder="Business Email"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Product Info */}
            <input
              type="text"
              placeholder="Product Name (brand or generic)"
              className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Preferred Brand"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="text"
                placeholder="Size / Unit (e.g. 1 gal, 50 lb)"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="number"
                placeholder="Estimated Monthly Quantity"
                className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <textarea
              placeholder="Additional details (usage, alternatives, urgency, etc.)"
              className="h-32 w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />

            {/* Priority / Intent */}
            <div className="grid gap-4 md:grid-cols-2">
              <select className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black">
                <option value="">How soon do you need this?</option>
                <option value="urgent">Urgent (ASAP)</option>
                <option value="soon">Within 1–2 weeks</option>
                <option value="planning">Just planning ahead</option>
              </select>

              <select className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black">
                <option value="">Would you order this regularly?</option>
                <option value="yes">Yes — recurring use</option>
                <option value="maybe">Possibly</option>
                <option value="one-time">One-time need</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-900 disabled:opacity-50"
            >
              {submitting ? "Submitting Request..." : "Submit Product Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
