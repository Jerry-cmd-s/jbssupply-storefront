"use client"

import { useState } from "react"
import Image from "next/image"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

//import ForgotPassword from "@modules/account/components/forgot-password"
//import ForgotPasswordPage from "@modules/account/components/forgot-password"
import ForgotPasswordPage from "app/forgot-password/page"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // ----- Forgot Password View -----
 // ----- Forgot Password View -----
if (showForgotPassword) {
  return (
    <div className="w-full max-w-md mx-auto my-12 bg-white rounded-2xl shadow-md p-8">
      <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
    </div>
  )
}

  // ----- Login View -----
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
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
          Welcome Back
        </h1>

        <p className="text-sm text-gray-600 mb-8 text-center md:text-left">
          Sign in to access an enhanced shopping experience.
        </p>

        <form className="w-full flex flex-col gap-y-4" action={formAction}>
          <Input
            label="Email"
            name="email"
            type="email"
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

          <ErrorMessage error={message} className="mt-2" />

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm underline text-gray-700 hover:text-gray-900"
            >
              Forgot your password?
            </button>
          </div>

          <SubmitButton className="w-full mt-6 bg-black hover:bg-gray-900">
            Sign In
          </SubmitButton>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Not a member?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="underline font-medium text-gray-900 hover:text-gray-700"
          >
            Join Us
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
