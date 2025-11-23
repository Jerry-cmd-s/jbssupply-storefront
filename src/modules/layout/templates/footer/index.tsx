import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer() {
  const { collections } = await listCollections({ fields: "*products" })
  const productCategories = await listCategories()

  const parentCategories = productCategories?.filter((c) => !c.parent_category) || []

  return (
    <footer className="border-t border-ui-border-base w-full bg-gray-50">
      <div className="content-container flex flex-col w-full">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between py-16 gap-10">
          {/* Brand Section */}
          <div className="flex flex-col gap-y-3">
            <LocalizedClientLink
              href="/"
              className="text-2xl font-semibold text-gray-900 hover:text-gray-700"
            >
              JB’s Supply
            </LocalizedClientLink>
            <p className="text-sm text-gray-500 max-w-xs">
              Your trusted supplier for restaurant and industrial essentials.
            </p>
          </div>

          {/* Categories */}
          {parentCategories.length > 0 && (
            <div>
              <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3 block">
                Products & Categories
              </span>
              <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                {parentCategories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="hover:text-gray-900 font-medium"
                    >
                      {c.name}
                    </LocalizedClientLink>
                    {c.category_children && c.category_children.length > 0 && (
                      <ul className="ml-3 mt-1 text-gray-500 space-y-1">
                        {c.category_children.map((child) => (
                          <li key={child.id}>
                            <LocalizedClientLink
                              href={`/categories/${child.handle}`}
                              className="hover:text-gray-800"
                            >
                              {child.name}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Collections */}
          {collections && collections.length > 0 && (
            <div>
              <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3 block">
                Industries We Supply
              </span>
              <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                {collections.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="hover:text-gray-900 font-medium"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info Links */}
          <div>
            <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3 block">
              Company
            </span>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <LocalizedClientLink
                  href="/privacy-policy"
                  className="hover:text-gray-900"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <a
                  href="https://docs.medusajs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-900"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/medusajs/nextjs-starter-medusa"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gray-900"
                >
                  Source Code
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 py-6 text-sm text-gray-500">
          <Text>© {new Date().getFullYear()} JB’s Supply. All rights reserved.</Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  )
}
