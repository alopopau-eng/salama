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
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-4 border-2 sm:border-4 border-black shadow-lg">
          {/* Top: Saudi Arabia text and flag */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 pb-1 sm:pb-2 border-b-2 border-black">
            <div className="text-[10px] sm:text-xs font-bold">K S A</div>
            <div className="text-center flex-1">
              <div className="text-[8px] sm:text-[10px] font-medium text-emerald-700">المملكة العربية السعودية</div>
            </div>
            <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" fill="#165E3C" />
              <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          {/* Main plate content */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Letters section (right side in RTL) */}
            <div className="flex-1 flex items-center justify-end gap-0.5 sm:gap-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-8 h-12 sm:w-12 sm:h-16 border border-black sm:border-2 rounded flex items-center justify-center bg-white text-xl sm:text-3xl font-bold"
                >
                  {letters?.[index] || ""}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-12 sm:h-16 w-0.5 sm:w-1 bg-black rounded"></div>

            {/* Numbers section (left side in RTL) */}
            <div className="flex-1 flex items-center justify-start gap-0.5 sm:gap-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-7 h-12 sm:w-10 sm:h-16 border border-black sm:border-2 rounded flex items-center justify-center bg-white text-xl sm:text-3xl font-bold font-mono"
                >
                  {numbers?.[index] || ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-lg border border-border bg-background text-foreground text-center text-lg sm:text-xl cursor-pointer"
              maxLength={4}
            />
            {letters && (
              <button
                type="button"
                onClick={handleLetterRemove}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 text-xl"
              >
                ×
              </button>
            )}
          </div>

          {/* Letter picker dropdown */}
          {showLetterPicker && (
            <div className="fixed sm:absolute z-50 inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:top-auto sm:translate-y-0 sm:left-0 sm:right-0 sm:mt-1 w-auto sm:w-full max-w-sm mx-auto p-3 sm:p-4 bg-white border-2 border-border rounded-lg shadow-2xl">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {arabicLetters.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleLetterSelect(letter)}
                    disabled={letters.length >= 4}
                    className="h-12 sm:h-10 rounded-lg border-2 border-border hover:border-teal-700 hover:bg-teal-700/10 font-bold text-xl sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowLetterPicker(false)}
                className="mt-3 w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50"
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
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-lg border border-border bg-background text-foreground text-center text-lg sm:text-xl font-mono"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  )
}
