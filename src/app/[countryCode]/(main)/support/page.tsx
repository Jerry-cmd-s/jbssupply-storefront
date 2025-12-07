import React from "react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Support</h1>
        <p className="text-lg text-gray-700 mb-8">
          We're here to help with anything related to your orders, deliveries, or account.
          Reach out anytime and our team will get back to you as fast as possible.
        </p>

        <div className="space-y-6">
          <div className="p-6 border rounded-xl bg-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900">Call Us</h2>
            <p className="text-lg text-gray-700 mt-2">754-333-0960</p>
          </div>

          <div className="p-6 border rounded-xl bg-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900">Email Support</h2>
            <p className="text-lg text-gray-700 mt-2">jerrycamijb@outlook.com</p>
          </div>

          <div className="p-6 border rounded-xl bg-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900">Hours</h2>
            <p className="text-lg text-gray-700 mt-2">Monday - Saturday: 9 AM - 7 PM</p>
            <p className="text-lg text-gray-700">Sunday: Closed</p>
          </div>
        </div>

        <div className="mt-12 p-6 border rounded-xl bg-white">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Send Us a Message</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <textarea
              placeholder="How can we help you?"
              className="w-full border rounded-xl p-3 h-32 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl text-lg font-semibold hover:bg-gray-900 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
