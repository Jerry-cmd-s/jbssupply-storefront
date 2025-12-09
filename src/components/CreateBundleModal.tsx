// src/components/CreateBundleModal.tsx
"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { saveBundle } from "lib/util/bundleUtils"
import { BundleItem } from "types/bundle"

/* ----------------------------- Types ----------------------------- */

type ProductVariant = {
  id: string
  prices?: { amount?: number }[]
}

type Product = {
  id: string
  title: string
  thumbnail?: string
  variants: ProductVariant[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  sdk: any
}

/* ----------------------------- Component ----------------------------- */

export default function CreateBundleModal({
  isOpen,
  onClose,
  sdk,
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedItems, setSelectedItems] = useState<BundleItem[]>([])
  const [bundleName, setBundleName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  /* ----------------------------- Load Products ----------------------------- */

  useEffect(() => {
    if (!isOpen) {
      setSelectedItems([])
      setBundleName("")
      return
    }

    let mounted = true

    sdk.products
      .list({ limit: 500 })
      .then((res: any) => {
        if (mounted) setProducts(res.products || [])
      })
      .catch(console.error)

    return () => {
      mounted = false
    }
  }, [isOpen, sdk])

  /* ----------------------------- Bundle Logic ----------------------------- */

  const toggleVariant = (product: Product, variantId: string) => {
    setSelectedItems((prev) => {
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

  const updateQuantity = (variantId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) =>
          i.variant_id === variantId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  /* ----------------------------- Save Bundle ----------------------------- */

  const handleSave = async () => {
    if (!bundleName.trim()) {
      alert("Please enter a bundle name")
      return
    }

    if (selectedItems.length === 0) {
      alert("Add at least one product to the bundle")
      return
    }

    try {
      setIsSaving(true)
      await saveBundle(sdk, bundleName.trim(), selectedItems)
      alert("Bundle saved successfully")
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save bundle")
    } finally {
      setIsSaving(false)
    }
  }

  /* ----------------------------- Guard ----------------------------- */

  if (!isOpen) return null

  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">Create Bundle</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Product Picker */}
          <div className="md:w-3/5 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((product) => {
                const variant = product.variants[0]
                if (!variant) return null

                const isAdded = selectedItems.some(
                  (i) => i.variant_id === variant.id
                )

                return (
                  <button
                    key={product.id}
                    onClick={() => toggleVariant(product, variant.id)}
                    className={`rounded-lg border-2 p-4 text-center transition ${
                      isAdded
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-32 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="h-32 rounded bg-gray-200" />
                    )}

                    <p className="mt-2 text-sm font-medium">
                      {product.title}
                    </p>

                    <div className="mt-2 text-sm font-semibold text-blue-600">
                      {isAdded ? "Added" : "+ Add"}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bundle Preview */}
          <div className="md:w-2/5 border-l bg-gray-50 p-6">
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name (e.g. Weekly Restock)"
              className="mb-6 w-full rounded-lg border px-4 py-3 text-lg"
            />

            {selectedItems.map((item) => {
              const product = products.find(
                (p) => p.id === item.product_id
              )

              return (
                <div
                  key={item.variant_id}
                  className="mb-3 flex items-center justify-between rounded bg-white p-4"
                >
                  <span className="font-medium">
                    {product?.title}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.variant_id, -1)
                      }
                    >
                      −
                    </button>

                    <span className="w-10 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.variant_id, 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              onClick={handleSave}
              disabled={
                isSaving || !bundleName || selectedItems.length === 0
              }
              className="mt-8 w-full rounded-lg bg-green-600 py-4 font-bold text-white disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
