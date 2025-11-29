"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { BarsThree, ArrowRightMini, XMark } from "@medusajs/icons"

import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  const menuItems = [
    { name: "Home", href: "/" },
    {
      name: "Products",
      children: [
        {
          name: "Products for Restaurants",
          href: "/categories/restaurant-supplies",
        },
        { name: "Spas", href: "/business/spas" },
        { name: "Bars", href: "/business/bars" },
        { name: "Cleaning", href: "/business/cleaning" },
      ],
    },
    { name: "Account", href: "/account" },
    { name: "Cart", href: "/cart" },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                >
                  <BarsThree className="w-6 h-6" />
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>

                    <ul className="flex flex-col gap-6 items-start justify-start w-full">
                      {menuItems.map((item) => (
                        <li key={item.name} className="w-full">
                          {"children" in item ? (
                            <>
                              <span className="text-3xl leading-10">
                                {item.name}
                              </span>

                              <ul className="ml-4 mt-3 flex flex-col gap-3">
                                {item.children.map((child) => (
                                  <li key={child.name}>
                                    <LocalizedClientLink
                                      href={child.href}
                                      className="text-lg hover:text-ui-fg-disabled"
                                      onClick={close}
                                    >
                                      {child.name}
                                    </LocalizedClientLink>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <LocalizedClientLink
                              href={item.href}
                              className="text-3xl leading-10 hover:text-ui-fg-disabled"
                              onClick={close}
                            >
                              {item.name}
                            </LocalizedClientLink>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>

                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} Medusa Store. All rights reserved.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
