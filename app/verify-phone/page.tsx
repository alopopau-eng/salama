"use client"

import { Suspense } from "react"
import { PhoneVerificationForm } from "@/components/phone-verification-form"
import { Loader2 } from "lucide-react"

export default function PhoneVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#1a5c85] to-[#2d7ba8] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      }
    >
      <PhoneVerificationForm />
    </Suspense>
  )
}
