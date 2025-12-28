"use client"

import React, { useState } from "react"

const faqs = [
  {
    question: "How do I place a recurring order?",
    answer:
      "You can create a bundle from your account dashboard. Once saved, you can load it into your cart and place repeat orders in seconds.",
  },
  {
    question: "Can I change or pause my bundle?",
    answer:
      "Yes. Bundles are fully flexible. You can edit quantities, remove items, or pause ordering at any time from your account.",
  },
  {
    question: "When do deliveries arrive?",
    answer:
      "Delivery schedules depend on your location and selected delivery window. Most orders are delivered within 24–48 hours.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards. Approved business customers may qualify for payment plans.",
  },
  {
    question: "What if an item is damaged or missing?",
    answer:
      "Contact support immediately. We resolve issues quickly and will replace or credit affected items.",
  },
]

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-semibold text-gray-900">
            Support Center
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Help with orders, deliveries, bundles, and account questions.
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Call Us</h3>
            <p className="mt-2 text-gray-700">754-333-0960</p>
            <p className="mt-1 text-sm text-gray-500">
              Mon–Sat, 9 AM – 7 PM
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
            <p className="mt-2 text-gray-700">jerrycamijb@outlook.com</p>
            <p className="mt-1 text-sm text-gray-500">
              Response within 24 hours
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
            <p className="mt-2 text-gray-700">
              Monday – Saturday<br />
              9:00 AM – 7:00 PM
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
                >
                  <span className="text-base font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <span className="text-xl text-gray-500">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="border border-gray-200 rounded-xl p-8">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Send Us a Message
          </h2>
          <p className="mb-6 text-gray-600">
            For anything not answered above, reach out directly.
          </p>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-900"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-900"
            />

            <textarea
              placeholder="How can we help you?"
              className="h-32 w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-900"
            />

            <button
              type="submit"
              className="w-full rounded-lg border border-gray-900 py-3 text-base font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition"
            >
              Submit Message
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
