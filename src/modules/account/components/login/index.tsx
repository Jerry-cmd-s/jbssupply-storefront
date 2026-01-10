"use client"

import Image from "next/image"
import Link from "next/link"
import { login } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

const Login = () => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div className="w-full max-w-5xl mx-auto my-8 flex flex-col md:flex-row bg-white rounded-2xl shadow-md overflow-hidden">
      
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-100 p-6">
        <Image
          src="/hero.png"
          alt="JB's Supply delivery network"
          width={450}
          height={185}
          className="object-contain"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center px-6 sm:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-3">Welcome Back</h1>

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

          <div className="text-right">
            <Link
              href="/account/forgot-password"
              className="text-sm underline text-gray-700 hover:text-black"
            >
              Forgot your password?
            </Link>
          </div>

          <ErrorMessage error={message} className="mt-2" />

          <SubmitButton className="w-full mt-4 bg-black">
            Sign In
          </SubmitButton>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Not a member?{" "}
          <Link
            href="/account/register"
            className="underline font-medium"
          >
            Join Us
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
