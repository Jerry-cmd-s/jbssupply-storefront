"use client"

import { useState } from "react"
import { sdk } from "lib/config"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      alert("Email is required")
      return
    }

    setLoading(true)

    try {
      await sdk.auth.resetPassword("customer", "emailpass", {
        identifier: email,
      })

      // Always succeed — do not expose account existence
      setSubmitted(true)
    } catch (err) {
      // Intentionally ignore errors to prevent enumeration
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>
          If an account exists with that email, you’ll receive instructions
          to reset your password.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Forgot your password?</h1>

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  )
}
