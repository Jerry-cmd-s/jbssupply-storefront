"use client"

import { useEffect, useMemo, useState } from "react"
import { sdk } from "lib/config"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  // Read token & email once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const t = params.get("token")
    const e = params.get("email")

    if (!t || !e) {
      return
    }

    setToken(t)
    setEmail(e)

    // Remove sensitive params from URL
    window.history.replaceState({}, "", "/app/reset-password")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !email) {
      alert("Invalid or expired reset link")
      return
    }

    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await sdk.auth.updateProvider(
        "customer",
        "emailpass",
        { email, password },
        token
      )

      alert("Password reset successfully")
      router.push("/account/login")
    } catch (err: any) {
      alert("This reset link is invalid or has expired")
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div>
        <h1>Invalid reset link</h1>
        <p>Please request a new password reset.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Reset your password</h1>

      <label>New Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label>Confirm Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}
