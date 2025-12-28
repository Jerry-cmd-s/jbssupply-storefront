"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { getPricesForVariant } from "@lib/util/get-product-price"
import {
  saveBundleAction,
  updateBundleAction,
} from "app/actions/bundleActions"

type BundleItem = {
  product_id: string
  variant_id: string
  quantity: number
}

type Bundle = {
  id: string
  name: string
  items: BundleItem[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  bundle?: Bundle | null
}

export default function CreateBundleModal({
  isOpen,
  onClose,
  bundle,
}: Props) {
  /* ---------- STATE ---------- */
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [selected, setSelected] = useState<BundleItem[]>([])
  const [bundleName, setBundleName] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  /* ---------- PREFILL (EDIT MODE) ---------- */
  useEffect(() => {
    if (!isOpen) return

    if (bundle) {
      setBundleName(bundle.name)
      setSelected(bundle.items)
    } else {
      setBundleName("")
      setSelected([])
    }

    setSearchQuery("")
  }, [bundle, isOpen])

  /* ---------- LOAD PRODUCTS ---------- */
  useEffect(() => {
    if (!isOpen) return

    const loadProducts = async () => {
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
        console.error(err)
        alert("Failed to load products")
      }
    }

    loadProducts()
  }, [isOpen])

  /* ---------- SEARCH ---------- */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products

    const q = searchQuery.toLowerCase()
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.title?.toLowerCase().includes(q))
    )
  }, [products, searchQuery])

  /* ---------- ADD / INCREMENT ITEM ---------- */
  const addItem = (product: HttpTypes.StoreProduct, variantId: string) => {
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

  /* ---------- UPDATE QUANTITY ---------- */
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

  /* ---------- TOTAL PRICE (FIXED) ---------- */
const totalPrice = useMemo(() => {
  return selected.reduce((total, item) => {
    const product = products.find(p => p.id === item.product_id)
    if (!product) return total

    const variant = product.variants?.find(
      v => v.id === item.variant_id
    )
    if (!variant) return total

    const price = getPricesForVariant(variant)

    const unitPrice =
      typeof price?.calculated_price === "number"
        ? price.calculated_price
        : Number(price?.calculated_price)

    if (!unitPrice || isNaN(unitPrice)) return total

    return total + unitPrice * item.quantity
  }, 0)
}, [selected, products])


  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!bundleName.trim()) {
      alert("Please enter a bundle name")
      return
    }

    if (!selected.length) {
      alert("Add at least one product")
      return
    }

    setLoading(true)
    try {
      const result = bundle
        ? await updateBundleAction(bundle.id, bundleName.trim(), selected)
        : await saveBundleAction(bundleName.trim(), selected)

      if (!result.success) {
        alert(result.error || "Failed to save bundle")
        return
      }

      alert(bundle ? "Bundle updated!" : "Bundle saved!")
      onClose()
    } catch {
      alert("Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  /* ---------- RENDER ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <h2 className="text-2xl font-bold">
            {bundle ? "Edit Bundle" : "Create Bundle"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full flex-col md:flex-row">
          {/* Products */}
          <div className="flex-1 overflow-y-auto p-6">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="mb-5 w-full rounded-xl border px-4 py-3"
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product) => {
                const variant = product.variants![0]
                const price = getPricesForVariant(variant)
                const added = selected.some(
                  (i) => i.variant_id === variant.id
                )

                return (
                  <div
                    key={product.id}
                    onClick={() => addItem(product, variant.id)}
                    className={`cursor-pointer rounded-xl border-2 p-3 text-center ${
                      added
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm font-medium">
                      {product.title}
                    </p>

                   {price?.calculated_price && (
  <p>
    {formatPrice(
      typeof price.calculated_price === "number"
        ? price.calculated_price
        : Number(price.calculated_price)
    )}
  </p>
)}


                    <span className="mt-3 inline-block rounded-full bg-black px-4 py-1 text-xs font-bold text-white">
                      {added ? "Added" : "+ Add"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="w-full border-t bg-gray-50 p-6 md:w-96 md:border-l">
            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Bundle name"
              className="mb-6 w-full rounded-xl border px-4 py-3"
            />

            <div className="space-y-3">
              {selected.map((item) => {
                const product = products.find(
                  (p) => p.id === item.product_id
                )

                return (
                  <div
                    key={item.variant_id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow"
                  >
                    <span className="text-sm font-medium">
                      {product?.title}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQty(item.variant_id, -1)
                        }
                        className="h-8 w-8 rounded bg-gray-200"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQty(item.variant_id, 1)
                        }
                        className="h-8 w-8 rounded bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 border-t pt-4 text-lg font-bold flex justify-between">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-black py-4 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Bundle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
