"use client"

import { useState } from "react"

interface SaudiPlateInputProps {
  numbers: string
  letters: string
  onNumbersChange: (value: string) => void
  onLettersChange: (value: string) => void
}

const arabicLetters = ["أ", "ب", "ح", "د", "ر", "س", "ص", "ط", "ع", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"]

export function SaudiPlateInput({ numbers, letters, onNumbersChange, onLettersChange }: SaudiPlateInputProps) {
  const [showLetterPicker, setShowLetterPicker] = useState(false)

  const handleLetterSelect = (letter: string) => {
    if (letters.length < 4) {
      onLettersChange(letters + letter)
    }
  }

  const handleLetterRemove = () => {
    onLettersChange(letters.slice(0, -1))
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">لوحة المركبة</label>

      {/* Saudi License Plate Visual */}
      <div className="relative mx-auto w-full max-w-md">
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 border-4 border-black shadow-lg">
          {/* Top: Saudi Arabia text and flag */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black">
            <div className="text-xs font-bold">K S A</div>
            <div className="text-center flex-1">
              <div className="text-[10px] font-medium text-emerald-700">المملكة العربية السعودية</div>
            </div>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" fill="#165E3C" />
              <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          {/* Main plate content */}
          <div className="flex items-center justify-between gap-4">
            {/* Letters section (right side in RTL) */}
            <div className="flex-1 flex items-center justify-end gap-1">
              {[0, 1, 2,3].map((index) => (
                <div
                  key={index}
                  className="w-12 h-16 border-2 border-black rounded flex items-center justify-center bg-white text-3xl font-bold"
                >
                  {letters?.[index] || ""}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-16 w-1 bg-black rounded"></div>

            {/* Numbers section (left side in RTL) */}
            <div className="flex-1 flex items-center justify-start gap-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-10 h-16 border-2 border-black rounded flex items-center justify-center bg-white text-3xl font-bold font-mono"
                >
                  {numbers?.[index] || ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Letters input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">الحروف (4 أحرف)</label>
          <div className="relative">
            <input
              type="text"
              value={letters}
              readOnly
              onClick={() => setShowLetterPicker(!showLetterPicker)}
              placeholder="اختر الحروف"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground text-center text-xl cursor-pointer"
              maxLength={4}
            />
            {letters && (
              <button
                type="button"
                onClick={handleLetterRemove}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Letter picker dropdown */}
          {showLetterPicker && (
            <div className="absolute z-10 mt-1 w-64 p-3 bg-white border-2 border-border rounded-lg shadow-xl">
              <div className="grid grid-cols-6 gap-2">
                {arabicLetters.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleLetterSelect(letter)}
                    disabled={letters.length >= 4}
                    className="h-10 rounded-lg border-2 border-border hover:border-teal-700 hover:bg-teal-700/10 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowLetterPicker(false)}
                className="mt-3 w-full py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>

        {/* Numbers input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">الأرقام (4 أرقام)</label>
          <input
            type="text"
            value={numbers}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "")
              if (value.length <= 4) {
                onNumbersChange(value)
              }
            }}
            placeholder="1234"
            className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground text-center text-xl font-mono"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  )
}
