import { Metadata } from "next"
import { Button, Heading } from "@medusajs/ui"
import { Package, Laptop, UtensilsCrossed, Leaf } from "lucide-react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Restaurants | JB’s Supply",
  description: "Explore restaurant supplies, kitchen tools, and eco-friendly products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function RestaurantsPage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO / INTRO SECTION */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-gray-100 border-b border-gray-200">
        <div className="content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading
            level="h1"
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            Restaurant Essentials, Simplified
          </Heading>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            From utensils to eco-friendly packaging — everything your restaurant needs to serve, pack, and thrive.
          </p>
          <Button
            variant="primary"
            className="rounded-full px-8 py-3 text-lg font-semibold bg-blue-600  transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Browse All Products
          </Button>
        </div>
      </section>

      {/* PRODUCT GRID (from StoreTemplate) */}
       
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  







      {/* WHY CHOOSE JB’S SUPPLY */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="content-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading
            level="h2"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12"
          >
            Why Restaurants Choose JB’s Supply
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: <Package className="h-10 w-10 text-indigo-600" />,
                title: "Reliable Supply",
                text: "Never run out. We keep your essentials in stock and deliver on time.",
              },
              {
                icon: <Leaf className="h-10 w-10 text-green-600" />,
                title: "Eco Options",
                text: "Leak-proof, sustainable packaging that protects food and the planet.",
              },
              {
                icon: <UtensilsCrossed className="h-10 w-10 text-indigo-600" />,
                title: "Bulk Savings",
                text: "Save on every order with smart bundles and volume pricing.",
              },
              {
                icon: <Laptop className="h-10 w-10 text-indigo-600" />,
                title: "Smart Ordering",
                text: "Reorder instantly or set up auto-restock reminders that fit your schedule.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}