"use client"

import { useEffect } from "react"

export function ResizeObserverSuppressor() {
  useEffect(() => {
    const suppressResizeObserverError = () => {
      window.addEventListener("error", (e) => {
        if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
          e.stopImmediatePropagation()
          return false
        }
      })
    }

    suppressResizeObserverError()
  }, [])

  return null 
}
