import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"

import CategoryTemplate from "@modules/categories/templates"
import CategorySearch from "../search"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{ page?: string }>
}

// Recursively collect IDs from parent + children
function collectCategoryIds(category: any) {
  const ids = [category.id]

  if (category.category_children?.length) {
    for (const child of category.category_children) {
      ids.push(...collectCategoryIds(child))
    }
  }

  return ids
}

export async function generateStaticParams() {
  const product_categories = await listCategories()
  if (!product_categories) return []

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map((cat) => cat.handle)

  const staticParams = countryCodes
    ?.map((countryCode) =>
      categoryHandles.map((handle) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  try {
    const productCategory = await getCategoryByHandle(params.category[0])
    const title = productCategory.name
    const description = productCategory.description ?? `${title} category.`

    return {
      title,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { page } = searchParams

  const productCategory = await getCategoryByHandle(params.category[0])
  if (!productCategory) notFound()

  // Build a full tree of IDs (parent + children)
  const categoryIds = collectCategoryIds(productCategory)

  return (
    <>
      <div className="mb-6">
        <CategorySearch
          categoryIds={categoryIds}        // supports all levels
          countryCode={params.countryCode}
          title="Search Products in this Category"
        />
      </div>

      <CategoryTemplate
        category={productCategory}
        categoryIds={categoryIds}        // required for product listing
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}
