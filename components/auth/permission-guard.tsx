"use client"

import { useEffect, useState, ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface PermissionGuardProps {
  children: ReactNode
  requiredPermission: string
  fallback?: ReactNode
}

export function PermissionGuard({ children, requiredPermission, fallback }: PermissionGuardProps) {
  const { user, hasPermission } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkPermission() {
      if (!user) {
        setHasAccess(false)
        return
      }

      const canAccess = await hasPermission(requiredPermission)
      setHasAccess(canAccess)
    }

    checkPermission()
  }, [user, requiredPermission, hasPermission])

  if (hasAccess === null) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this resource.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
