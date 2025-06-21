"use client"

import { useAppContext } from "@/contexts/app-context"
import type { Currency } from "@/contexts/app-context"

interface CurrencyDisplayProps {
  amount: number
  fromCurrency?: Currency
  className?: string
  showCode?: boolean
}

export function CurrencyDisplay({ amount, fromCurrency, className = "", showCode = false }: CurrencyDisplayProps) {
  const { formatCurrency, getCurrencyInfo } = useAppContext()

  const formattedAmount = formatCurrency(amount, fromCurrency)
  const currencyInfo = getCurrencyInfo()

  return (
    <span className={className}>
      {formattedAmount}
      {showCode && <span className="ml-1 text-xs text-muted-foreground">{currencyInfo.code}</span>}
    </span>
  )
}
