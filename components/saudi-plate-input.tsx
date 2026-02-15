"use client";

import { useState } from "react";

interface SaudiPlateInputProps {
  numbers: string;
  letters: string;
  onNumbersChange: (value: string) => void;
  onLettersChange: (value: string) => void;
}

const arabicLetters = [
  "أ",
  "ب",
  "ح",
  "د",
  "ر",
  "س",
  "ص",
  "ط",
  "ع",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
];

export function SaudiPlateInput({
  numbers,
  letters,
  onNumbersChange,
  onLettersChange,
}: SaudiPlateInputProps) {
  const [showLetterPicker, setShowLetterPicker] = useState(false);

  const arabicToWestern = (str: string) => {
    const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/[٠-٩]/g, (d) => arabicNums.indexOf(d).toString());
  };

  const handleLetterSelect = (letter: string) => {
    if (letters.length < 4) {
      onLettersChange(letter);
    }
  };

  const handleLetterRemove = () => {
    onLettersChange(letters.slice(0, -1));
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        لوحة المركبة
      </label>

      {/* Saudi License Plate Visual */}
      <div className="relative mx-auto w-full max-w-2xl">
        <div className="bg-white rounded-2xl p-1 border-[6px] border-gray-800 shadow-2xl">
          {/* Top row */}
          <div className="grid grid-cols-3 gap-0 border-b-2 border-gray-800">
            {/* Left section - Numbers (top) */}
            <div className="flex items-center justify-center h-16 border-r-2 border-gray-800">
              <div className="flex gap-2">
                {[0, 1].map((index) => (
                  <div key={index} className="text-3xl font-bold font-mono">
                    {numbers?.[index] || " "}
                  </div>
                ))}
              </div>
            </div>

            {/* Center section - Flag and text */}
            <div className="flex flex-col items-center justify-center h-16 px-4">
              <svg className="w-8 h-8 mb-1" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" fill="#165E3C" rx="2" />
                <path
                  d="M12 8l-1.5 4h3L12 8z M8 14h8 M10 16l2-2 2 2"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-[10px] font-bold text-gray-800">
                السعودية
              </div>
              <div className="text-[9px] font-bold text-gray-600">KSA</div>
            </div>

            {/* Right section - Letters (top) */}
            <div className="flex items-center justify-center h-16 border-l-2 border-gray-800">
              <div className="flex gap-2">
                {[0, 1].map((index) => (
                  <div key={index} className="text-3xl font-bold">
                    {letters?.[index] || " "}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-0">
            {/* Left section - Numbers (bottom) */}
            <div className="flex items-center justify-center h-16 border-r-2 border-gray-800">
              <div className="flex gap-2">
                {[2, 3].map((index) => (
                  <div key={index} className="text-3xl font-bold font-mono">
                    {numbers?.[index] || " "}
                  </div>
                ))}
              </div>
            </div>

            {/* Center section - Empty */}
            <div className="h-16"></div>

            {/* Right section - Letters (bottom) */}
            <div className="flex items-center justify-center h-16 border-l-2 border-gray-800">
              <div className="flex gap-2">
                {[2, 3].map((index) => (
                  <div key={index} className="text-3xl font-bold">
                    {letters?.[index] || " "}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Letters input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">الحروف</label>
          <div className="relative">
            <input
              type="text"
              value={letters}
              onChange={(e) => handleLetterSelect(e.target.value)}
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
          <label className="text-xs text-muted-foreground">الأرقام</label>
          <input
            type="text"
            inputMode="numeric"
            value={numbers}
            onChange={(e) => {
              const normalized = arabicToWestern(e.target.value);
              const value = normalized.replace(/[^0-9]/g, "");
              if (value.length <= 4) {
                onNumbersChange(value);
              }
            }}
            placeholder="1234"
            className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground text-center text-xl font-mono"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  );
}
