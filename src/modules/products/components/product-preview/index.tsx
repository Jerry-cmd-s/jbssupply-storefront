"use client"

import { Text, Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import { getCartId, setCartId } from "@lib/data/cookies"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [loading, setLoading] = useState(false)

  const { cheapestPrice } = getProductPrice({ product })
  const defaultVariant = product.variants?.[0]

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!defaultVariant) return

    try {
      setLoading(true)

      let cartId = getCartId()

      // Create cart if it doesn't exist
      if (!cartId) {
        const cartRes = await fetch("/api/cart", {
          method: "POST",
        })

        const { cart } = await cartRes.json()
        cartId = cart.id
        setCartId(cartId)
      }

      // Add item to cart
      await fetch(`/api/cart/${cartId}/line-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_id: defaultVariant.id,
          quantity: 1,
        }),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group">
      {/* Product navigation */}
      <LocalizedClientLink href={`/products/${product.handle}`}>
        <div data-testid="product-wrapper">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />

          <div className="flex txt-compact-medium mt-4 justify-between items-start">
            <Text className="text-ui-fg-subtle">
              {product.title}
            </Text>

            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>

      {/* Add to Cart */}
      <Button
        size="small"
        className="mt-3 w-full"
        onClick={handleAddToCart}
        disabled={loading || !defaultVariant}
      >
        {loading ? "Adding…" : "Add to Cart"}
      </Button>
    </div>
  )
}
