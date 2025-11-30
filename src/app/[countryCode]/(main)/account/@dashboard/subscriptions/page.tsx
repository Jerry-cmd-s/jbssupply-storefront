"use client"

import { useState } from "react"
import { Button, Heading } from "@medusajs/ui"
import { Package } from "lucide-react"

// Sample product list — you can fetch from your Medusa backend later
const products = [
  { id: "p1", name: "Eco Utensils Set", price: 15 },
  { id: "p2", name: "Starter Kit", price: 50 },
  { id: "p3", name: "Cleaning Supplies", price: 20 },
  { id: "p4", name: "Napkins & Paper Goods", price: 10 },
  { id: "p5", name: "Specialty Sauces", price: 25 },
]

export default function BuildBundle() {
  const [bundle, setBundle] = useState<string[]>([])

  const toggleProduct = (id: string) => {
    setBundle((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    )
  }

  const totalPrice = bundle
    .map((id) => products.find((p) => p.id === id)?.price || 0)
    .reduce((a, b) => a + b, 0)

  const handleCheckout = () => {
    alert(
      `Bundle Created! Products: ${bundle
        .map((id) => products.find((p) => p.id === id)?.name)
        .join(", ")} | Total Price: $${totalPrice}`
    )
    // In future: send bundle to cart / subscription API
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Heading level="h1" className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Package size={28} /> Build Your Bundle
      </Heading>

      <p className="mb-6 text-gray-700">
        Select the products you want to include in your custom bundle. Later, you can turn this bundle into a subscription.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-all ${
              bundle.includes(product.id)
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

      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">Total: ${totalPrice}</span>
        <Button
          variant="primary"
          size="large"
          onClick={handleCheckout}
          disabled={bundle.length === 0}
        >
          Add Bundle to Cart
        </Button>
      </div>
    </div>
  )
}
