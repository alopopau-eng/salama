'use client';

import { Loader2 } from "lucide-react";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="text-sm font-medium text-stone-600">
          جاري المعالجة...
        </p>
      </div>
    </div>
  );
}
