"use client";

import { Text, Button } from "@medusajs/ui";
import { HttpTypes } from "@medusajs/types";
import { useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getProductPrice } from "@lib/util/get-product-price";
import Thumbnail from "../thumbnail";
import PreviewPrice from "./price";
import { addToCartAction } from 'app/actions/cartActions'; // Add this import

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct;
  isFeatured?: boolean;
  region: HttpTypes.StoreRegion;
}) {
  const [loading, setLoading] = useState(false);
  const { cheapestPrice } = getProductPrice({ product });
  const defaultVariant = product.variants?.[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;

    setLoading(true);
    const result = await addToCartAction(defaultVariant.id, 1);
    setLoading(false);

    if (result.success) {
      alert("Product added to cart!");
    } else {
      alert(result.error || "Failed to add to cart");
    }
  };

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
  );
}