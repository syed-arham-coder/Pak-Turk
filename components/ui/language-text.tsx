"use client"

import { useAppContext } from "@/contexts/app-context"

interface LanguageTextProps {
  translationKey: string
  params?: Record<string, string>
  fallback?: string
  className?: string
}

export function LanguageText({ translationKey, params, fallback, className = "" }: LanguageTextProps) {
  const { t } = useAppContext()

  const text = t(translationKey, params) || fallback || translationKey

  return <span className={className}>{text}</span>
}
