import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Image from "next/image"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 backdrop-blur-md bg-white/80 border-b border-ui-border-base">
      <header className="relative w-full h-16">
        {/* This is the magic wrapper — full width, no overflow */}
        <nav className="flex h-full items-center justify-between w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4 h-full">
            <div className="block md:hidden">
              <SideMenu regions={regions} />
            </div>
            <LocalizedClientLink href="/" data-testid="nav-store-link">
              <Image
                src="/jbssupply.png"
                alt="JB's Supply Logo"
                width={85}
                height={61}
                className="object-contain"
                priority
              />
            </LocalizedClientLink>
          </div>

          {/* Right: Links + Cart */}
          <div className="flex items-center gap-x-6 h-full">
            <div className="relative group">
              <button className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1">
                Products
              </button>
              <div className="absolute top-full left-0 pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <div className="bg-white border border-ui-border-base shadow-lg rounded-md min-w-[200px] overflow-hidden">
                  <LocalizedClientLink
                    href="/categories/restaurant-supplies"
                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Products for Restaurants
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/business/spas"
                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Spas
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/business/bars"
                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Bars
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/business/cleaning"
                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cleaning
                  </LocalizedClientLink>
                </div>
              </div>
            </div>

            <LocalizedClientLink
              className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1"
              href="/account"
            >
              Account
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1"
                  href="/cart"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}