"use client"

import Image from "next/image"
import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div className="w-full max-w-5xl mx-auto my-8 flex flex-col md:flex-row bg-white rounded-2xl shadow-md overflow-hidden">
      
      {/* Left Image */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100 p-6">
        <Image
          src="/hero.png"
          alt="JB'S Supply South Florida delivery network map"
          width={450}
          height={185}
          className="object-contain"
        />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex flex-col px-6 sm:px-8 py-8">
        {/* Header */}
       <div className="text-brown-200 px-4 py-5">
  <h1 className="text-xl sm:text-2xl font-semibold">
    Become a JB’s Supply Member
  </h1>
  <p className="text-xs sm:text-sm mt-1">
    Business-only pricing, bundles, and payment flexibility.
  </p>
</div>


        {/* Features */}
        <ul className="text-xs sm:text-sm text-gray-700 mb-5 space-y-1 list-disc list-inside">
          <li>Create reusable product bundles</li>
          <li>Access member-only pricing & promotions</li>
          <li>Fast checkout and order tracking</li>
          <li>Priority business support</li>
        </ul>

        {/* Form */}
        <form className="w-full flex flex-col gap-y-3" action={formAction}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
            />
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Company name"
            name="company_name"
            required
            placeholder="e.g. Jerry’s Pizzeria"
          />

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              name="industry"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Select industry</option>
              <option value="restaurant">Restaurant</option>
              <option value="bar">Bar / Lounge</option>
              <option value="cafe">Cafe</option>
              <option value="cleaning">Cleaning Services</option>
              <option value="hotel">Hotel / Hospitality</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
          />

          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
          />

          <ErrorMessage error={message} />

          <p className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to JB’s Supply{" "}
            <LocalizedClientLink href="/content/privacy-policy" className="underline">
              Privacy Policy
            </LocalizedClientLink>{" "}
            and{" "}
            <LocalizedClientLink href="/content/terms-of-use" className="underline">
              Terms of Use
            </LocalizedClientLink>.
          </p>

          <SubmitButton className="w-full mt-5 bg-black hover:bg-gray-900">
            Create Business Account
          </SubmitButton>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center md:text-left">
          Already a member?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="underline font-medium text-gray-900 hover:text-gray-700"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
