// Updated Hero + MainContent with JBSSupply Values + Icons
// Icons use lucide-react (installed in medusa storefront by default)

"use client"

import { Button, Heading } from "@medusajs/ui"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ShieldCheck, Leaf, PackageCheck } from "lucide-react" // Icons

// Animation variants for the single word
const wordVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const secondaryTextVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
}

const Hero = () => {
  const [wordIndex, setWordIndex] = useState(0)
  const [showNextDay, setShowNextDay] = useState(false)

  const words = ["Restaurants", "Salon & Spas", "Cafes", "Bars"]

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length)
      setShowNextDay((prev) => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[48vh] w-full border-b border-ui-border-base bg-gradient-to-br from-black-900 to-red-600">
      <div className="absolute inset-0 z-10 flex flex-col justify-start items-center text-center gap-5 px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 md:pt-28">

        {/* Bigger Main Heading */}
        <div>
          <Heading
            level="h1"
            className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl leading-tight text-black-900"
          >
            Supplying{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={words[wordIndex]}
                variants={wordVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="text-blue-600"
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>{" "}
            with Total Solutions
          </Heading>
        </div>

        {/* Bigger Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Heading
            level="h2"
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-black-900 font-light max-w-xl md:max-w-2xl mx-auto"
          >
            From eco-friendly utensils to complete restaurant starter kits, JB’s
            Supply delivers <span className="font-semibold">reliability</span> and{" "}
            <span className="font-semibold">value</span>.
          </Heading>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-1">
          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
            <Button
              variant="primary"
              size="large"
              className="rounded-2xl shadow-lg px-5 py-2.5 bg-red-700 text-white focus:ring-2 focus:ring-black-500"
            >
              Shop Bundles
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
            <Button
              variant="secondary"
              size="large"
              className="rounded-2xl px-5 py-2.5 border-black-900 text-black-900 focus:ring-2 focus:ring-black-500 transition-colors"
            >
              Build Bundle
            </Button>
          </motion.div>
        </div>

        {/* Delivery Message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={showNextDay ? "next-day" : "same-day"}
            className="text-sm sm:text-md md:text-lg text-black-900 font-medium mt-2"
            variants={secondaryTextVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            We offer{" "}
            <span className="font-semibold">
              {showNextDay ? "next-day delivery" : "same-day delivery"}
            </span>
            . Schedule your supplies with us today.
          </motion.p>
        </AnimatePresence>

      </div>
    </div>
  )
}


const MainContent = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.2, ease: "easeOut" } }),
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)", transition: { duration: 0.2 } },
  }

  const values = [
    {
      title: "Reliability",
      desc: "We deliver on time, every time, so your business never skips a beat.",
      icon: ShieldCheck,
    },
    {
      title: "Eco‑Friendly Options",
      desc: "Sustainable products that help your business reduce waste without reducing quality.",
      icon: Leaf,
    },
    {
      title: "Value‑Driven Bundles",
      desc: "Bundles designed to save you money while giving you everything you need.",
      icon: PackageCheck,
    },
  ]

  return (
    <main className="w-full py-16 sm:py-20 bg-gray-100">
      <section className="content-container text-center mb-16 sm:mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Heading level="h2" className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black-900">
            Why Choose JB’s Supply?
          </Heading>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-xl md:max-w-2xl mx-auto">
            We focus on reliability, sustainability, and value — the core essentials that help small businesses grow with confidence.
          </p>
        </motion.div>
      </section>

      <section className="content-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
        {values.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="p-6 sm:p-8 border border-gray-300 rounded-2xl shadow-sm bg-white hover:bg-blue-100/50 transition-colors"
          >
            <feature.icon className="w-12 h-12 text-green-600 mb-4 mx-auto" />
            <Heading level="h3" className="text-lg sm:text-xl font-semibold mb-2 text-black-900">
              {feature.title}
            </Heading>
            <p className="text-gray-700 text-sm sm:text-base">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="content-container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Heading level="h2" className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black-900">
            Trusted by Local Businesses
          </Heading>
          <p className="text-gray-700 text-base sm:text-lg max-w-xl md:max-w-2xl mx-auto">
            From restaurants and cafés to spas and beyond, JB’s Supply helps small businesses thrive with reliable service and tailored bundles.
          </p>
        </motion.div>
      </section>
    </main>
  )
}

export default Hero
export { MainContent }
