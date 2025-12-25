"use client"

import React, { useEffect, useActionState, useState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type Props = {
  customer: HttpTypes.StoreCustomer
}

const ProfileCompany: React.FC<Props> = ({ customer }) => {
  const [successState, setSuccessState] = useState(false)

  const updateCompany = async (_: any, formData: FormData) => {
    const company_name = formData.get("company_name") as string

    try {
      await updateCustomer({
        metadata: {
          ...customer.metadata,
          company_name,
        },
      })

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.toString() }
    }
  }

  const [state, formAction] = useActionState(updateCompany, {
    error: null,
    success: false,
  })

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Company Name"
        currentInfo={
          (customer.metadata?.company_name as string) || "Not set"
        }
        isSuccess={successState}
        isError={!!state.error}
        clearState={() => setSuccessState(false)}
      >
        <Input
          label="Company name"
          name="company_name"
          required
          defaultValue={(customer.metadata?.company_name as string) || ""}
        />
      </AccountInfo>
    </form>
  )
}

export default ProfileCompany
