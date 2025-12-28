"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div className="w-full">

      {/* MOBILE */}
      <div className="small:hidden border-b border-gray-200" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 px-6 py-4 text-sm font-medium text-gray-700"
          >
            <ChevronDown className="rotate-90" />
            Account
          </LocalizedClientLink>
        ) : (
          <>
            <div className="px-6 py-4 text-lg font-semibold text-gray-900">
              Hello {customer?.first_name}
            </div>

            <ul className="divide-y divide-gray-200">
              <MobileLink href="/account/profile" icon={<User size={18} />}>
                Profile
              </MobileLink>

              <MobileLink href="/account/addresses" icon={<MapPin size={18} />}>
                Addresses
              </MobileLink>

              <MobileLink href="/account/bundles" icon={<Package size={18} />}>
                Bundle Subscription
              </MobileLink>

              <MobileLink href="/account/orders" icon={<Package size={18} />}>
                Orders
              </MobileLink>

              <li>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between px-6 py-4 text-sm text-gray-700"
                >
                  <div className="flex items-center gap-x-2">
                    <ArrowRightOnRectangle />
                    Log out
                  </div>
                  <ChevronDown className="-rotate-90" />
                </button>
              </li>
            </ul>
          </>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden small:block" data-testid="account-nav">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Account
          </h3>

          <ul className="flex flex-col gap-y-3">
            <AccountNavLink href="/account" route={route!}>
              Overview
            </AccountNavLink>

            <AccountNavLink href="/account/profile" route={route!}>
              Profile
            </AccountNavLink>

            <AccountNavLink href="/account/addresses" route={route!}>
              Addresses
            </AccountNavLink>

            <AccountNavLink href="/account/bundles" route={route!}>
              Bundle Subscription
            </AccountNavLink>

            <AccountNavLink href="/account/orders" route={route!}>
              Orders
            </AccountNavLink>

            <li className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>

    </div>
  )
}

const MobileLink = ({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <li>
    <LocalizedClientLink
      href={href}
      className="flex items-center justify-between px-6 py-4 text-sm text-gray-700"
    >
      <div className="flex items-center gap-x-2">
        {icon}
        {children}
      </div>
      <ChevronDown className="-rotate-90" />
    </LocalizedClientLink>
  </li>
)

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
}

const AccountNavLink = ({
  href,
  route,
  children,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()
  const active = route.split(countryCode)[1] === href

  return (
    <li>
      <LocalizedClientLink
        href={href}
        className={clx(
          "block rounded-lg px-3 py-2 text-sm transition",
          active
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        {children}
      </LocalizedClientLink>
    </li>
  )
}

export default AccountNav
