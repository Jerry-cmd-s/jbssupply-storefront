"use client"

import { useState, useTransition, useEffect } from "react"
import { searchProductsInCategory } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { motion, AnimatePresence } from "framer-motion"

export default function CategorySearch({
  categoryId,
  countryCode,
  title, // new prop for title
}: {
  categoryId: string
  countryCode: string
  title?: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([])
  const [isPending, startTransition] = useTransition()
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const handleSearch = (value: string) => {
    setQuery(value)

    if (debounceTimer) clearTimeout(debounceTimer)

    setDebounceTimer(
      setTimeout(() => {
        startTransition(async () => {
          if (value.trim().length === 0) {
            setResults([])
            return
          }

          const data = await searchProductsInCategory({
            categoryId,
            query: value,
            countryCode,
          })

          setResults(data || [])
        })
      }, 300)
    )
  }

  const highlightMatch = (title: string) => {
    if (!query) return title
    const regex = new RegExp(`(${query})`, "gi")
    return title.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200">{part}</span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="mb-6 w-full max-w-md mx-auto relative">
      {title && <h2 className="text-xl font-semibold mb-3">{title}</h2>} {/* Title above search */}

      <input
        type="text"
        className="w-full border border-blue-600 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        placeholder="Search products..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isPending && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-t-indigo-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-white shadow-lg rounded-lg overflow-hidden border z-50 relative"
          >
            {results.map((p) => (
              <a
                key={p.id}
                href={`/products/${p.handle}`}
                className="block px-4 py-3 hover:bg-indigo-50 transition"
              >
                {highlightMatch(p.title)}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
