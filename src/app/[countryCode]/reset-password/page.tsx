"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { sdk } from "lib/config"

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  // Read token & email from URL query parameters on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    const e = params.get("email")

    if (t && e) {
      setToken(t)
      setEmail(e)
      // Remove sensitive info from URL
      window.history.replaceState({}, "", "/reset-password")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token || !email) {
      alert("Invalid or expired reset link.")
      return
    }

    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    try {
      // Update the customer's password via Medusa SDK
      await sdk.auth.updateProvider("customer", "emailpass", { email, password }, token)
      alert("Password reset successfully!")
      router.push("/account")
    } catch (err: any) {
      alert(`Couldn't reset password: ${err.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-md rounded-xl">
        <h1 className="text-xl font-semibold mb-4">Invalid reset link</h1>
        <p>Please request a new password reset from the login page.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-12 p-6 bg-white shadow-md rounded-xl flex flex-col gap-4"
    >
      <h1 className="text-2xl font-semibold text-center mb-4">Reset your password</h1>

      <label className="font-medium">New Password</label>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-black text-white p-2 rounded hover:bg-gray-900"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}
