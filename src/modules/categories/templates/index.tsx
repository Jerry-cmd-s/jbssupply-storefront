import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  page?: string
  countryCode: string
}) {
  if (!category || !countryCode) notFound()

  const pageNumber = page ? parseInt(page) : 1
  const parents: HttpTypes.StoreProductCategory[] = []

  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="content-container py-10 md:py-16"
      data-testid="category-container"
    >
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
        {parents.map((parent, i) => (
          <span key={parent.id} className="flex items-center">
            <LocalizedClientLink
              href={`/categories/${parent.handle}`}
              className="hover:text-black transition-colors"
            >
              {parent.name}
            </LocalizedClientLink>
            {i < parents.length && <span className="mx-2">/</span>}
          </span>
        ))}
        <span className="font-semibold text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <header className="mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
          data-testid="category-page-title"
        >
          {category.name}
        </h1>

        {category.description && (
          <p className="text-gray-600 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </header>

      {/* Subcategories */}
      {category.category_children && category.category_children.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Explore {category.name} Categories
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {category.category_children.map((child) => (
              <li key={child.id}>
                <InteractiveLink
                  href={`/categories/${child.handle}`}
                  className="block border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  {child.name}
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Product Grid */}
      <section>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </section>
    </div>
  )
}
