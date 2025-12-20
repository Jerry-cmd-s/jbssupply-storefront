"use client";

import React, { useState } from "react";

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
      "Contact support immediately. We resolve issues fast and will replace or credit affected items.",
  },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen  py-16 px-4">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Support Center</h1>
          <p className="mt-4 text-lg text-gray-700">
            Fast help for orders, deliveries, bundles, and account questions.
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-14">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-semibold text-gray-900">Call Us</h3>
            <p className="mt-2 text-gray-700">754-333-0960</p>
            <p className="mt-1 text-sm text-gray-500">
              Mon–Sat, 9 AM – 7 PM
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
            <p className="mt-2 text-gray-700">jerrycamijb@outlook.com</p>
            <p className="mt-1 text-sm text-gray-500">
              We usually reply within 24 hours
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
            <p className="mt-2 text-gray-700">
              Monday – Saturday<br />
              9:00 AM – 7:00 PM
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16 rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <span className="text-xl">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {openIndex === index && (
                  <div className="border-t px-5 pb-5 pt-4 text-gray-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Send Us a Message
          </h2>
          <p className="mb-6 text-gray-700">
            For anything not answered above, reach out directly.
          </p>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <textarea
              placeholder="How can we help you?"
              className="h-32 w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-black py-3 text-lg font-semibold text-white hover:bg-gray-900 transition"
            >
              Submit Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
