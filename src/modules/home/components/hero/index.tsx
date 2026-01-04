"use client"
import Image from "next/image"
import { Button, Heading } from "@medusajs/ui"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ShieldCheck, Zap, PackageCheck } from "lucide-react"
import Link from "next/link"
// animations
const wordVariants = { enter: { opacity: 0, y: 20 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } }
const secondaryTextVariants = { enter: { opacity: 0, y: 10 }, center: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } }
const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
}

const Hero = () => {
  const [wordIndex, setWordIndex] = useState(0)
  const [showNextDay, setShowNextDay] = useState(false)
  const words = ["Restaurants", "Food Trucks", "Cafes", "Bars", "Offices"]

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length)
      setShowNextDay((prev) => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-screen md:h-[80vh] w-full overflow-hidden border-b border-ui-border-base bg-gradient-to-br from-black-900 to-red-600">




      
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 sm:px-8 md:px-12">

        {/* Main heading */}
    <div className="max-w-5xl -mt-12 md:-mt-16">
 <Heading
  level="h2"
  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-black-900 font-calibri"
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
      className="text-blue-600 inline-block"
    >
      {words[wordIndex]}
    </motion.span>
  </AnimatePresence>{" "}
  with Total Solutions
</Heading>
</div>


        {/* Subheading */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-6 max-w-3xl">
          <Heading level="h2" className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black-900 font-light leading-relaxed font-calibri">
            Your Partner in Reliable Supply, Supporting Every Industry You Serve. JB’s Supply delivers{" "}
            <span className="font-semibold">reliability</span> and <span className="font-semibold">value</span>.
          </Heading>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <motion.div variants={buttonVariants} initial="hidden" animate="visible">
            <Button variant="primary" size="medium" className="rounded-2xl shadow-lg px-10 py-5 bg-red-900 text-white text-lg font-medium font-calibri">
              Shop Bundles
            </Button>
          </motion.div>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover">
          

<Link href="/account/">
  <Button
    variant="secondary"
    size="large"
    className="rounded-2xl px-10 py-5 bg-gray border-2 border-black-900 text-black-900 text-lg font-medium font-calibri"
  >
    Build Bundle
  </Button>
</Link>

          </motion.div>
        </div>

        {/* Delivery text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={showNextDay ? "next-day" : "same-day"}
            className="mt-6 text-lg sm:text-xl lg:text-2xl text-black-900 font-medium font-calibri"
            variants={secondaryTextVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            We offer{" "}
            <span className="font-bold text-red-600 font-calibri">
              {showNextDay ? "next-day delivery" : "Payment Plan"}
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
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.2 } }),
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)", transition: { duration: 0.2 } },
  }

  const coreValues = [
    {
      title: "Value-Driven",
      desc: "Affordable bundles and quality supplies designed to maximize your margins.",
      icon: PackageCheck,
    },
    {
      title: "Efficiency",
      desc: "Fast delivery, smooth ordering, and reliable stock availability.",
      icon: Zap,
    },
    {
      title: "Reliability",
      desc: "We show up on time and your products do what they’re supposed to do.", 
      icon: ShieldCheck,
    },
  ]

  return (
    <main className="w-full py-16 sm:py-20 bg-gray-100">

      {/* Why Choose Us */}
      <section className="content-container text-center mb-16 sm:mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex justify-center">
  <Image
    src="/flvan.png"
    alt="JB'S Supply South Florida delivery network map"
    width={450}
    height={185}
  />
</div>

          <Heading level="h2" className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black-900 font-calibri">
            Why Choose JB’s Supply?
          </Heading>
          <p className="text-gray-700 text-base sm:text-lg max-w-xl md:max-w-2xl mx-auto font-calibri">
            We provide affordable, eco-friendly, and complete supply solutions that help small businesses grow with confidence.
          </p>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="content-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
        {coreValues.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            className="p-6 sm:p-8 border border-gray-300 rounded-2xl shadow-sm bg-white hover:bg-red-100/50 transition-colors"
          >
            <feature.icon className="w-12 h-12 text-red-600 mb-4 mx-auto" />

            <Heading level="h3" className="text-lg sm:text-xl font-semibold mb-2 text-black-900">
              {feature.title}
            </Heading>

            <p className="text-gray-700 text-sm sm:text-base">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Social proof */}
      <section className="content-container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Heading level="h2" className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black-900 font-calibri">
            Trusted by Local Businesses
          </Heading>
          <p className="text-gray-700 text-base sm:text-lg max-w-xl md:max-w-2xl mx-auto font-calibri">
            From restaurants and cafés to spas and beyond, JB’s Supply helps small businesses thrive with reliable service and tailored bundles.
          </p>
        </motion.div>
      </section>
    </main>
  )
}

export default Hero
export { MainContent }
