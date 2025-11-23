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
    <div className="sticky top-0 inset-x-0 z-50 backdrop-blur-md bg-white/80 border-b border-ui-border-base shadow-sm">
      <header className="h-16">
        <nav className="content-container flex items-center justify-between h-full">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4 h-full">
            {/* Only show menu on mobile */}
            <div className="block md:hidden">
              <SideMenu regions={regions} />
            </div>
            {/* Logo */}
            <LocalizedClientLink href="/" data-testid="nav-store-link">
              <Image
                src="/jbssupply.png"
                alt="JB's Supply Logo"
                width={85}
                height={61}
                className="object-contain"
              />
            </LocalizedClientLink>
          </div>
          {/* Right: Links + Cart */}
          <div className="flex items-center gap-x-6 h-full">
            {/* Business Type Dropdown */}
            <div className="relative group flex items-center">
              <button
                className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors px-2 py-1"
                data-testid="nav-business-type-button"
              >
                Products
              </button>
              {/* Wider Dropdown Menu with Persistent Hover, Positioned Underneath */}
              <div className="absolute invisible group-hover:visible bg-white border border-ui-border-base shadow-lg rounded-md top-full left-0 z-10 min-w-[200px] transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 group-hover:delay-100">
                <LocalizedClientLink
                  href="/categories/restaurant-supplies"
                  className="block px-4 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
                  data-testid="nav-restaurants-link"
                >
                 Products for Restaurants
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/business/spas"
                  className="block px-4 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
                  data-testid="nav-spas-link"
                >
                  Spas
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/business/bars"
                  className="block px-4 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
                  data-testid="nav-bars-link"
                >
                  Bars
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/business/cleaning"
                  className="block px-4 py-2 text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
                  data-testid="nav-cleaning-link"
                >
                  Cleaning
                </LocalizedClientLink>
              </div>
            </div>
            <LocalizedClientLink
              className="hidden small:inline-block text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors flex items-center px-2 py-1"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1"
                  href="/cart"
                  data-testid="nav-cart-link"
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