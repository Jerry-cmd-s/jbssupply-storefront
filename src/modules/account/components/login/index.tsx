"use client"

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
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md overflow-hidden my-8 px-6 sm:px-8 py-8 flex flex-col items-center">
      
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
        Welcome Back
      </h1>
      <p className="text-center text-sm sm:text-base text-gray-600 mb-8">
        Sign in to access an enhanced shopping experience.
      </p>

      {/* Form */}
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

        <ErrorMessage error={message} className="mt-2" />

        <SubmitButton className="w-full mt-6 bg-black hover:bg-gray-900">
          Sign In
        </SubmitButton>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline font-medium text-gray-900 hover:text-gray-700"
        >
          Join Us
        </button>
        .
      </p>
    </div>
  )
}

export default Login
