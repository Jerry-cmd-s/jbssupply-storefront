"use client";

import { Button, Heading } from "@medusajs/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Animation variants
const wordVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const secondaryTextVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const Hero = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [showNextDay, setShowNextDay] = useState(false);
  const words = ["Restaurants", "Salon & Spas", "Cafes", "Bars"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
      setShowNextDay((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen w-full bg-gradient-to-br from-black via-black-900 to-red-700 overflow-hidden">
      {/* Optional subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 sm:px-8 md:px-12 text-center gap-8 sm:gap-10">
        {/* Main Heading */}
        <Heading
          level="h1"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white"
        >
          Supplying{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={words[wordIndex]}
              variants={wordVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-red-500 inline-block"
            >
              {words[wordIndex]}
            </motion.span>
          </AnimatePresence>{" "}
          with Total Solutions
        </Heading>

        {/* Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Heading
            level="h2"
            className="text-lg sm:text-xl md:text-2xl font-light text-gray-100 max-w-3xl mx-auto leading-relaxed"
          >
            From eco-friendly utensils to complete restaurant starter kits, JB’s Supply delivers{" "}
            <span className="font-bold text-red-400">reliability</span> and{" "}
            <span className="font-bold text-red-400">value</span>.
          </Heading>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
            <Button
              variant="primary"
              size="large"
              className="rounded-full px-8 py-4 text-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-xl transition-all"
            >
              Shop Bundles
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
            <Button
              variant="secondary"
              size="large"
              className="rounded-full px-8 py-4 text-lg font-medium border-2 border-white/80 text-white backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              Build Bundle
            </Button>
          </motion.div>
        </div>

        {/* Delivery Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={showNextDay ? "next-day" : "same-day"}
            variants={secondaryTextVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-gray-200 font-medium"
          >
            We offer{" "}
            <span className="font-bold text-red-400">
              {showNextDay ? "next-day delivery" : "same-day delivery"}
            </span>
            . Schedule your supplies today.
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
};
const MainContent = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.2, ease: "easeOut" },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.2 },
    },
  }

  return (
    <main className="w-full py-16 sm:py-20 bg-gray-100">
      {/* WHY CHOOSE US */}
      <section className="content-container text-center mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Heading
            level="h2"
            className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black-900"
          >
            Why Choose JB’s Supply?
          </Heading>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-xl md:max-w-2xl mx-auto">
            We provide affordable, eco-friendly, and complete supply solutions
            that help restaurants, cafés, spas, and other small businesses grow
            with confidence.
          </p>
        </motion.div>
      </section>

      {/* FEATURE GRID */}
      <section className="content-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
        {[
          {
            title: "Starter Kits",
            desc: "Essential bundles designed to help new businesses launch smoothly.",
          },
          {
            title: "Eco Supplies",
            desc: "Sustainable, high-quality products that make your customers feel good.",
          },
          {
            title: "Bulk Options",
            desc: "Stock up and save — reliable supply for your growing operations.",
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="p-6 sm:p-8 border border-gray-300 rounded-2xl shadow-sm bg-white hover:bg-red-100/50 transition-colors"
          >
            <Heading
              level="h3"
              className="text-lg sm:text-xl font-semibold mb-2 text-black-900"
            >
              {feature.title}
            </Heading>
            <p className="text-gray-700 text-sm sm:text-base">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* SOCIAL PROOF */}
      <section className="content-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Heading
            level="h2"
            className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black-900"
          >
            Trusted by Local Businesses
          </Heading>
          <p className="text-gray-700 text-base sm:text-lg max-w-xl md:max-w-2xl mx-auto">
            From restaurants and cafés to spas and beyond, JB’s Supply helps
            small businesses thrive with reliable service and tailored bundles.
          </p>
        </motion.div>
      </section>
    </main>
  )
}


export default Hero
export { MainContent }