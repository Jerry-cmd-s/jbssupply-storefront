"use client"

import { useState } from "react"
import { Button, Heading, Input } from "@medusajs/ui"
import { Package } from "lucide-react"

// Sample products — replace with API fetch in the future
const products = [
  { id: "p1", name: "Eco Utensils Set", price: 15 },
  { id: "p2", name: "Starter Kit", price: 50 },
  { id: "p3", name: "Cleaning Supplies", price: 20 },
  { id: "p4", name: "Napkins & Paper Goods", price: 10 },
  { id: "p5", name: "Specialty Sauces", price: 25 },
]

export default function BuildBundle() {
  const [bundleName, setBundleName] = useState("")
  const [bundleProducts, setBundleProducts] = useState<string[]>([])

  const toggleProduct = (id: string) => {
    setBundleProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    )
  }

  const totalPrice = bundleProducts
    .map((id) => products.find((p) => p.id === id)?.price || 0)
    .reduce((a, b) => a + b, 0)

  const handleSaveBundle = () => {
    if (!bundleName) {
      alert("Please enter a name for your bundle.")
      return
    }
    if (bundleProducts.length === 0) {
      alert("Please select at least one product.")
      return
    }

    alert(
      `Bundle Created!\nName: ${bundleName}\nProducts: ${bundleProducts
        .map((id) => products.find((p) => p.id === id)?.name)
        .join(", ")}\nTotal Price: $${totalPrice}`
    )

    // Future: Send bundle to cart or subscription API
    setBundleName("")
    setBundleProducts([])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Heading level="h1" className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Package size={28} /> Build Your Bundle
      </Heading>

      <p className="mb-4 text-gray-700">
        Name your bundle and select the products you want to include. You can later convert it to a subscription.
      </p>

      {/* Bundle name input */}
      <Input
        placeholder="Enter your bundle name"
        value={bundleName}
        onChange={(e) => setBundleName(e.target.value)}
        className="mb-6"
      />

      {/* Product selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-all ${
              bundleProducts.includes(product.id)
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => toggleProduct(product.id)}
          >
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">${product.price}</p>
          </div>
        ))}
      </div>

      {/* Summary and Save */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-semibold text-lg">Total: ${totalPrice}</span>
        <Button
          variant="primary"
          size="large"
          onClick={handleSaveBundle}
          disabled={!bundleName || bundleProducts.length === 0}
        >
          Save Bundle
        </Button>
      </div>
    </div>
  )
}
