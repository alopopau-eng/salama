"use client"

import { useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"
import { getRedirectUrl } from "./page-routes"

/**
 * Hook that listens to the visitor's Firestore document and redirects
 * when `currentPage` is set to a page other than `myPageKey`.
 *
 * Use this on pages that do NOT already have their own onSnapshot listener.
 * Pages that already have a listener should call `getRedirectUrl()` directly
 * inside their existing listener callback instead.
 */
export function usePageRedirect(myPageKey: string) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const visitorId = localStorage.getItem("visitor")
    if (!visitorId) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorId),
      (snap) => {
        if (!snap.exists()) return
        const data = snap.data()
        const url = getRedirectUrl(data.currentPage, myPageKey)
        if (url) {
          window.location.href = url
        }
      },
      (err) => console.error("usePageRedirect error:", err),
    )

    return () => unsubscribe()
  }, [myPageKey])
}
