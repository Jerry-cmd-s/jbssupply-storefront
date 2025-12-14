// src/components/CreateBundleModal.tsx
"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { saveBundle } from "@lib/util/bundleUtils"
import { getPricesForVariant } from "@lib/util/get-product-price"

type BundleItem = {
  product_id: string
  variant_id: string
  quantity: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function CreateBundleModal({ isOpen, onClose }: Props) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [selected, setSelected] = useState<BundleItem[]>([])
  const [bundleName, setBundleName] = useState("")
  const [loading, setLoading] = useState(false)

  /**
   * Load products when modal opens
   */
  useEffect(() => {
    if (!isOpen) {
      setSelected([])
      setBundleName("")
      return
    }

    const fetchProducts = async () => {
      try {
        const { products } = await sdk.store.product.list({
          limit: 200,
          fields:
            "id,title,thumbnail,variants.id,variants.title,variants.calculated_price",
        })

        setProducts(
          products.filter(
            (p): p is HttpTypes.StoreProduct =>
              Array.isArray(p.variants) && p.variants.length > 0
          )
        )
      } catch (err) {
        console.error("Failed to load products", err)
        alert("Failed to load products. Please refresh.")
      }
    }

    fetchProducts()
  }, [isOpen])

  /**
   * Add / increment bundle item
   */
  const toggleItem = (
    product: HttpTypes.StoreProduct,
    variantId: string
  ) => {
    setSelected((prev) => {
      const existing = prev.find((i) => i.variant_id === variantId)

      if (existing) {
        return prev.map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      return [
        ...prev,
        {
          product_id: product.id,
          variant_id: variantId,
          quantity: 1,
        },
      ]
    })
  }

  /**
   * Update quantity
   */
  const updateQty = (variantId: string, delta: number) => {
    setSelected((prev) =>
      prev
        .map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  /**
   * Save bundle
   */
  const handleSave = async () => {
    if (!bundleName.trim()) {
      alert("Please enter a bundle name")
      return
    }

    if (selected.length === 0) {
      alert("Add at least one product")
      return
    }

    setLoading(true)

    try {
      await saveBundle(sdk, bundleName.trim(), selected)
      alert("Bundle saved successfully")
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save bundle")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-8 py-5">
          <h2 className="text-3xl font-bold">Create Bundle</h2>
          <button
            onClick={onClose}
            className="rounded-full p-3 hover:bg-gray-200"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="flex h-full flex-col md:flex-row">
          {/* Products */}
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="mb-6 text-xl font-semibold">
              Choose Products ({products.length})
            </h3>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const variant = product.variants![0]
                const price = getPricesForVariant(variant)
                const isAdded = selected.some(
                  (i) => i.variant_id === variant.id
                )

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleItem(product, variant.id)}
                    className={`cursor-pointer rounded-xl border-2 p-5 text-center transition ${
                      isAdded
                        ? "border-purple-600 bg-black"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="mx-auto mb-4 h-40 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mx-auto mb-4 h-40 rounded-lg bg-gray-200" />
                    )}

                    <p className="line-clamp-2 font-medium">
                      {product.title}
                    </p>

                    {price && (
                      <p className="mt-2 text-lg font-bold text-black">
                        {price.calculated_price}
                      </p>
                    )}

                    <span
                      className={`mt-4 inline-block rounded-full px-6 py-2 text-sm font-bold ${
                        isAdded
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isAdded ? "Added" : "+ Add"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="w-full border-t bg-gray-50 p-8 md:w-96 md:border-l md:border-t-0">
            <h3 className="mb-6 text-xl font-semibold">Bundle Preview</h3>

            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="e.g. Monthly Cleaning Kit"
              className="w-full rounded-xl border px-5 py-4 text-lg"
            />

            <div className="mt-8 space-y-4">
              {selected.map((item) => {
                const product = products.find(
                  (p) => p.id === item.product_id
                )

                return (
                  <div
                    key={item.variant_id}
                    className="flex items-center justify-between rounded-xl bg-white p-5 shadow"
                  >
                    <span className="font-medium">
                      {product?.title}
                    </span>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          updateQty(item.variant_id, -1)
                        }
                        className="h-9 w-9 rounded-lg bg-gray-200"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.variant_id, 1)
                        }
                        className="h-9 w-9 rounded-lg bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleSave}
              disabled={
                loading || !bundleName.trim() || selected.length === 0
              }
              className="mt-10 w-full rounded-xl bg-black py-5 text-xl font-bold text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
