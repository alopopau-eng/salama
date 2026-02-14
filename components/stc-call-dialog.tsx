"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Phone, ArrowLeft } from "lucide-react"

interface StcCallDialogProps {
  open: boolean
  onComplete: () => void
}

export function StcCallDialog({ open, onComplete }: StcCallDialogProps) {
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    if (!open) {
      setTimeLeft(30)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden [&>button]:hidden"
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Purple STC header */}
        <div className="bg-gradient-to-l from-[#4f0b7b] to-[#6b2fa0] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
          <div className="relative">
            <span className="text-5xl font-black tracking-tight block mb-3" style={{ fontFamily: "sans-serif" }}>stc</span>
            <DialogHeader>
              <DialogTitle className="text-xl text-white">مكالمة التحقق</DialogTitle>
              <DialogDescription className="text-white/80 mt-1">الاتصالات السعودية</DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Call info */}
          <div className="bg-purple-50 border-r-4 border-purple-500 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-purple-700" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-purple-900">ستتلقى مكالمة من الرقم</p>
                <p className="text-2xl font-bold text-purple-700" dir="ltr">900</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#4f0b7b] text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <p className="text-sm text-gray-800 font-medium">قم بالرد على المكالمة من الرقم 900</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#4f0b7b] text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <p className="text-sm text-gray-800 font-medium">
                اضغط على الرقم <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#4f0b7b] text-white font-bold text-sm mx-1">5</span> للتأكيد
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">في انتظار المكالمة</p>
            <p className="text-lg font-bold text-[#4f0b7b]">{timeLeft > 0 ? `00:${timeLeft.toString().padStart(2, "0")}` : "يمكنك المتابعة"}</p>
          </div>

          {/* Continue button */}
          <Button
            onClick={onComplete}
            className="w-full h-12 text-base bg-[#4f0b7b] hover:bg-[#3d0860]"
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            متابعة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
