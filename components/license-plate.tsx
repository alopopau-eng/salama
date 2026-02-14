"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LicensePlateProps {
  value?: {
    numbers: string
    letter1: string
    letter2: string
    letter3: string
  }
  onChange?: (value: any) => void
}

const ARABIC_LETTERS = [
  { en: "A", ar: "أ" },
  { en: "B", ar: "ب" },
  { en: "J", ar: "ح" },
  { en: "D", ar: "د" },
  { en: "R", ar: "ر" },
  { en: "S", ar: "س" },
  { en: "X", ar: "ص" },
  { en: "T", ar: "ط" },
  { en: "E", ar: "ع" },
  { en: "G", ar: "ق" },
  { en: "K", ar: "ك" },
  { en: "L", ar: "ل" },
  { en: "Z", ar: "م" },
  { en: "N", ar: "ن" },
  { en: "H", ar: "هـ" },
  { en: "U", ar: "و" },
  { en: "V", ar: "ى" },
]

export function LicensePlate({ value, onChange }: LicensePlateProps) {
  const [numbers, setNumbers] = React.useState(value?.numbers || "")
  const [l1, setL1] = React.useState(value?.letter1 || "")
  const [l2, setL2] = React.useState(value?.letter2 || "")
  const [l3, setL3] = React.useState(value?.letter3 || "")

  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  React.useEffect(() => {
    onChangeRef.current?.({ numbers, letter1: l1, letter2: l2, letter3: l3 })
  }, [numbers, l1, l2, l3])

  return (
    <div className="space-y-4">
      {/* Plate Visualization */}
      <div
        className="border-2 border-black rounded-lg w-full max-w-sm mx-auto h-24 flex overflow-hidden bg-white shadow-sm"
        dir="ltr"
      >
        {/* Left Side (English) */}
        <div className="flex-1 flex flex-col items-center justify-center border-r-2 border-black relative">
          <div className="absolute top-1 left-2 text-[10px] font-bold tracking-widest text-gray-500">KSA</div>
          <div className="flex flex-row-reverse gap-4 w-full justify-center items-center h-full pt-4">
            {/* Letters Section */}
            <div className="flex gap-1 text-2xl font-bold min-w-[60px] justify-center">
              <span>{l3 || "•"}</span>
              <span>{l2 || "•"}</span>
              <span>{l1 || "•"}</span>
            </div>
            {/* Divider */}
            <div className="h-12 w-0.5 bg-black/20"></div>
            {/* Numbers Section */}
            <div className="text-2xl font-bold tracking-widest min-w-[60px] text-center">{numbers || "••••"}</div>
          </div>
          <div className="flex w-full justify-between px-4 pb-1 text-sm font-bold text-gray-400 opacity-50">
            <div className="flex gap-2">
              <span>{l1 && ARABIC_LETTERS.find((a) => a.en === l1)?.ar}</span>
              <span>{l2 && ARABIC_LETTERS.find((a) => a.en === l2)?.ar}</span>
              <span>{l3 && ARABIC_LETTERS.find((a) => a.en === l3)?.ar}</span>
            </div>
            <div>
              {numbers
                .split("")
                .map((n) => Number(n).toLocaleString("ar-SA"))
                .join("")}
            </div>
          </div>
        </div>

        {/* Emblem Section */}
        <div className="w-16 bg-white border-l-2 border-black flex flex-col items-center justify-center p-1 relative overflow-hidden">
          <div className="text-[8px] font-bold text-center leading-tight mb-1">
            السعودية
            <br />
            KSA
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-green-800 flex items-center justify-center relative bg-white">
            {/* Swords and Palm Tree SVG */}
            <svg viewBox="0 0 100 100" className="w-6 h-6 text-green-800 fill-current">
              {/* Palm Tree */}
              <path d="M50 10 C 45 25, 45 25, 30 30 C 45 35, 48 35, 50 50 C 52 35, 55 35, 70 30 C 55 25, 55 25, 50 10" />
              {/* Crossed Swords */}
              <path d="M20 70 L 80 90 M 80 70 L 20 90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-4 gap-2" dir="rtl">
        {/* Numbers Input first in RTL visual flow (right to left) */}
        <Input
          className="text-center font-mono tracking-widest text-lg"
          placeholder="1234"
          maxLength={4}
          value={numbers}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "")
            setNumbers(val)
          }}
        />

        <Select value={l1} onValueChange={setL1}>
          <SelectTrigger className="text-center justify-center">
            <SelectValue placeholder="أ" />
          </SelectTrigger>
          <SelectContent>
            {ARABIC_LETTERS.map((l) => (
              <SelectItem key={l.en} value={l.en}>
                {l.ar} - {l.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={l2} onValueChange={setL2}>
          <SelectTrigger className="text-center justify-center">
            <SelectValue placeholder="ح" />
          </SelectTrigger>
          <SelectContent>
            {ARABIC_LETTERS.map((l) => (
              <SelectItem key={l.en} value={l.en}>
                {l.ar} - {l.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={l3} onValueChange={setL3}>
          <SelectTrigger className="text-center justify-center">
            <SelectValue placeholder="د" />
          </SelectTrigger>
          <SelectContent>
            {ARABIC_LETTERS.map((l) => (
              <SelectItem key={l.en} value={l.en}>
                {l.ar} - {l.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
