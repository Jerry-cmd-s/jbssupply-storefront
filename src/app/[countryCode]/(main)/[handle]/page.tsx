export const revalidate = 0 // ✅ force fresh data every time

import StoreTemplate from "@modules/store/templates"
import { getCategoryByHandle } from "@lib/data/categories"
import { Button, Heading } from "@medusajs/ui"
import { Metadata } from "next"

type Props = {
  params: {
    countryCode: string
    handle: string
  }
  searchParams?: {
    sortBy?: string
    page?: string
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { countryCode, handle } = params

  // ✅ Fetch category with no caching
  const category = await getCategoryByHandle(handle, { cache: "no-store" })

  if (!category) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-gray-600">Category "{handle}" not found.</p>
      </div>
    )
  }

 return (
  <>
    <CategorySearch categoryId={category.id} countryCode={countryCode} />
    <StoreTemplate
      categoryId={category.id}
      countryCode={countryCode}
      page={searchParams?.page}
      title={category.name}
    />
  </>
)
}
