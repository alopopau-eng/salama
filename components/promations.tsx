"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface PromotionalPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function PromotionalPopup({ isOpen, onClose }: PromotionalPopupProps) {
  // Countdown timer: 6 hours from now
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 59,
    seconds: 58,
  })

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          clearInterval(timer)
          return prev
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const formatTime = (num: number) => String(num).padStart(2, "0")

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4">
          {/* Promotional Banner */}
          <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-8 text-white">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <div className="w-12 h-12 bg-white rounded-lg" />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold leading-tight text-balance">For Our Distinguished Partner Customers</h2>

            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white p-8 space-y-6">
            <h3 className="text-2xl font-bold text-red-600 text-center">Hurry Before the Offer Ends!</h3>

            <div className="text-center space-y-3">

              {/* Countdown Timer */}
              <div className="text-6xl font-bold text-emerald-600 tabular-nums tracking-tight">
                {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white text-lg py-6 rounded-xl font-medium"
              size="lg"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
