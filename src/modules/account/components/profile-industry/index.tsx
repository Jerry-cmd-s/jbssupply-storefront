"use client"

import React, { useEffect, useActionState, useState } from "react"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type Props = {
  customer: HttpTypes.StoreCustomer
}

const industries = [
  "Restaurant",
  "Bar / Lounge",
  "Cafe",
  "Hotel / Hospitality",
  "Cleaning Services",
  "Other",
]

const ProfileIndustry: React.FC<Props> = ({ customer }) => {
  const [successState, setSuccessState] = useState(false)

  const updateIndustry = async (_: any, formData: FormData) => {
    const industry = formData.get("industry") as string

    try {
      await updateCustomer({
        metadata: {
          ...customer.metadata,
          industry,
        },
      })

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.toString() }
    }
  }

  const [state, formAction] = useActionState(updateIndustry, {
    error: null,
    success: false,
  })

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Industry"
        currentInfo={
          (customer.metadata?.industry as string) || "Not set"
        }
        isSuccess={successState}
        isError={!!state.error}
        clearState={() => setSuccessState(false)}
      >
        <select
          name="industry"
          defaultValue={(customer.metadata?.industry as string) || ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          required
        >
          <option value="">Select industry</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </AccountInfo>
    </form>
  )
}

export default ProfileIndustry
