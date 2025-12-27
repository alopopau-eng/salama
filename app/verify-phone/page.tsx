"use client";

import { Suspense, useState } from "react";
import {
  Menu,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PhoneVerificationForm } from "@/components/phone-verification-form";

function PhoneVerificationContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50 font-sans" dir="rtl" lang="ar">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-stone-800" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="text-sm font-bold text-stone-900 mb-2">
                مركز سلامة المركبات
              </h1>
              <p className="text-xs text-stone-500">Vehicles Safety Center</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
              مس
            </div>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Phone Verification */}
        <Suspense
          fallback={<div className="text-center py-12">جاري التحميل...</div>}
        >
          <PhoneVerificationForm />
        </Suspense>
      </main>

      {/* Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-colors">
          <MessageCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="text-center mb-12 pb-12 border-b border-stone-200">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-stone-600 mb-2">هل بحاجة للمساعدة؟</p>
            <p className="text-sm text-stone-500 mb-4">
              تواصل معنا عبر القنوات المتاحة
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:info@saso.gov.sa"
                className="text-sm text-green-600 hover:text-green-700"
              >
                info@saso.gov.sa
              </a>
            </div>
          </div>

          <div className="text-center">
            <div className="flex justify-center gap-4 mb-6">
              <Facebook className="w-5 h-5 text-stone-400 hover:text-stone-600 cursor-pointer transition" />
              <Twitter className="w-5 h-5 text-stone-400 hover:text-stone-600 cursor-pointer transition" />
              <Instagram className="w-5 h-5 text-stone-400 hover:text-stone-600 cursor-pointer transition" />
            </div>
            <p className="text-xs text-stone-500 mb-4">
              أحكام وشروط | سياسة الخصوصية
            </p>
            <p className="text-xs text-stone-400">
              © 2025 مركز سلامة المركبات. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PhoneVerificationPage() {
  return <PhoneVerificationContent />;
}
