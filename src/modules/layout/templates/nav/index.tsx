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
    <>
      {/* Animated Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 overflow-hidden relative shadow-md">
        <div className="animate-marquee whitespace-nowrap inline-block">
          <span className="mx-12 text-sm md:text-base font-semibold tracking-wide">
            🚚 Same Day Delivery Available • 💳 Flexible Payment Plans
          </span>
          <span className="mx-12 text-sm md:text-base font-semibold tracking-wide">
            🚚 Same Day Delivery Available • 💳 Flexible Payment Plans
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-6">
              <SideMenu regions={regions} />
              <LocalizedClientLink href="/" className="flex items-center">
                <Image
                  src="/logo.png" // Replace with your actual logo path
                  alt="Your Brand"
                  width={140}
                  height={40}
                  className="object-contain"
                />
              </LocalizedClientLink>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-10 text-base font-medium">
              <LocalizedClientLink href="/products" className="hover:text-blue-600 transition">
                Products
              </LocalizedClientLink>

              <div className="relative group">
                <button className="hover:text-blue-600 transition">Products for</button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white shadow-xl rounded-xl border border-gray-100 py-6 px-8 min-w-[220px] text-gray-800">
                    <LocalizedClientLink
                      href="/products/restaurants"
                      className="block py-2 hover:text-blue-600 transition"
                    >
                      Restaurants
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/products/spas"
                      className="block py-2 hover:text-blue-600 transition"
                    >
                      Spas
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/products/bars"
                      className="block py-2 hover:text-blue-600 transition"
                    >
                      Bars
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/products/cleaning"
                      className="block py-2 hover:text-blue-600 transition"
                    >
                      Cleaning
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>

              <LocalizedClientLink href="/request" className="hover:text-blue-600 transition">
                Products Request
              </LocalizedClientLink>

              <LocalizedClientLink href="/support" className="hover:text-blue-600 transition">
                Support
              </LocalizedClientLink>

              <LocalizedClientLink href="/account" className="hover:text-blue-600 transition">
                Account
              </LocalizedClientLink>

              <CartButton />
            </div>

            {/* Mobile Cart (visible on small screens) */}
            <div className="lg:hidden">
              <CartButton />
            </div>
          </nav>
        </div>
      </header>

      {/* Global animation styles */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  )
}