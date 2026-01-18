export default function PrivacyPolicyPage() {
  return (
    <div className="content-container py-12 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-900">
          Privacy & Company Policies
        </h1>

        <p className="text-base text-gray-700 leading-relaxed mb-6">
          Welcome to JBSSupply. We are committed to protecting your privacy and operating
          with transparency. This page outlines how we handle information, orders,
          deliveries, returns, and other key policies.
        </p>

        {/* Privacy */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-gray-700">
            We may collect personal and business information including name, email address,
            phone number, billing details, and order history when you interact with our
            services or place an order.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Use of Information</h2>
          <p className="text-gray-700">
            Information is used to process orders, manage accounts, communicate service
            updates, and maintain secure transactions. We do not sell or share customer
            information with third parties except where required to fulfill services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Data Protection</h2>
          <p className="text-gray-700">
            JBSSupply implements reasonable administrative and technical safeguards to
            protect customer data from unauthorized access, misuse, or disclosure.
          </p>
        </section>

        {/* Delivery Policy */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Delivery & Scheduling Policy</h2>
          <p className="text-gray-700 mb-2">
            JBSSupply operates on a scheduled delivery model to ensure efficiency and
            competitive pricing.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Standard service includes one scheduled delivery per billing cycle.</li>
            <li>Customers may order any quantity for their scheduled delivery.</li>
            <li>
              Last-minute or unscheduled deliveries requested outside the agreed schedule
              will incur a <strong>$7 flat delivery fee</strong>.
            </li>
            <li>
              Repeated last-minute requests may require a pricing or service review.
            </li>
          </ul>
        </section>

        {/* Customer Service */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Customer Service</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              Phone:{" "}
              <a href="tel:+1754-333-0960" className="text-blue-600 underline">
                +1 754-333-0960
              </a>
            </li>
            <li>
              Email:{" "}
              <a
                href="mailto:jerrycamijb@outlook.com"
                className="text-blue-600 underline"
              >
                jerrycamijb@outlook.com
              </a>
            </li>
          </ul>
        </section>

        {/* Returns */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Return Policy</h2>
          <p className="text-gray-700">
            Returns are accepted within 30 days of delivery for unused products in original
            packaging. All returns require prior authorization from JBSSupply.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Refund & Dispute Policy</h2>
          <p className="text-gray-700">
            Approved refunds are processed within 7–10 business days after returned items
            are received. Customers are encouraged to contact us directly to resolve any
            billing disputes prior to initiating chargebacks.
          </p>
        </section>

        {/* Cancellation */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">8. Cancellation Policy</h2>
          <p className="text-gray-700">
            Orders may be canceled within 24 hours of placement. Orders already processed,
            shipped, or specially sourced may not be eligible for cancellation.
          </p>
        </section>

        {/* Legal */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">9. Legal & Compliance</h2>
          <p className="text-gray-700">
            Certain products may be subject to regulatory or export restrictions. Customers
            are responsible for ensuring compliance with all applicable laws.
          </p>
        </section>

        {/* Promotions */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">10. Promotions & Special Offers</h2>
          <p className="text-gray-700">
            Promotions are subject to availability, time limitations, and specific terms.
            JBSSupply reserves the right to modify or discontinue promotions at any time.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold mb-2">11. Contact Us</h2>
          <p className="text-gray-700">
            Questions regarding these policies can be directed to{" "}
            <a
              href="mailto:jerrycamijb@outlook.com"
              className="text-blue-600 underline"
            >
              jerrycamijb@outlook.com
            </a>{" "}
            or by phone at{" "}
            <a href="tel:+1754-333-0960" className="text-blue-600 underline">
              +1 754-333-0960
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
