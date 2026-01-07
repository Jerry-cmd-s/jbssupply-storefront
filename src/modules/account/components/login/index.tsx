"use client"

import Image from "next/image"
import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

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
      <div className="w-full md:w-1/2 flex flex-col items-center px-6 sm:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3 text-center md:text-left">
          Welcome Back
        </h1>

        <p className="text-center md:text-left text-sm sm:text-base text-gray-600 mb-8">
          Sign in to access an enhanced shopping experience.
        </p>

        <form className="w-full flex flex-col gap-y-4" action={formAction}>
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.RESET_PASSWORD)}
              className="text-sm underline text-gray-700 hover:text-gray-900"
            >
              Forgot password?
            </button>
          </div>

          <ErrorMessage error={message} className="mt-2" />

          <SubmitButton className="w-full mt-4 bg-black hover:bg-gray-900">
            Sign In
          </SubmitButton>
        </form>

        <p className="text-center md:text-left text-sm text-gray-600 mt-6">
          Not a member?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="underline font-medium text-gray-900 hover:text-gray-700"
          >
            Join Us
          </button>
          .
        </p>
      </div>
    </div>
  )
}

export default Login
