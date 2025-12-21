import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Image from "next/image"

export default async function Nav(): Promise<JSX.Element> {
  const regions: StoreRegion[] = await listRegions().then(
    (regions) => regions
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 backdrop-blur-md bg-white/80 border-b border-ui-border-base">
      {/* 🔔 Announcement Banner */}
      <div className="w-full bg-black text-white text-sm overflow-hidden">
       {/* 🔔 Announcement Banner */}
<div className="w-full bg-black text-white text-sm overflow-hidden">
 <div className="w-full bg-black text-white text-sm">
  <div className="content-container-safe flex justify-center items-center py-2">
    <span className="opacity-60 mx-3">•</span>
    <span className="mx-3">Flexible Payment Plans</span>
    <span className="opacity-60 mx-3">•</span>
    <span className="mx-3">Same-Day Delivery Available</span>
    <span className="opacity-60 mx-3">•</span>
  </div>
</div>
</div>

      </div>

      <header className="relative w-full h-16">
        <nav className="content-container-safe flex h-full items-center justify-between w-full">
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
            {/* Products dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1"
              >
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
              href="/product-request"
              className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1"
            >
              Product Request
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/support"
              className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1"
            >
              Support
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/account"
              className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1"
            >
              Account
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  className="hover:text-ui-fg-base flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1"
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
