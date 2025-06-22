"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import {
  LayoutDashboard,
  Building,
  Users,
  Package,
  MessageSquare,
  CalendarDays,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useAppContext } from "@/contexts/app-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { suppressResizeObserverError, debounce } from "@/lib/resize-observer-error-handler"

interface AppSidebarProps {
  userRole: "Admin" | "Manager" | "User"
  companyName: string
  companyLogo?: string
}

const getInitials = (name: string | undefined | null) => {
  if (!name) return '?';
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function AppSidebar({ userRole, companyName, companyLogo }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t, mounted } = useAppContext()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    suppressResizeObserverError()
  }, [])

  const menuItems = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard, roles: ["Admin", "Manager", "User"] },
    { href: "/dashboard/company", label: t("sidebar.companies"), icon: Building, roles: ["Admin", "Manager"] },
    { href: "/dashboard/users", label: t("sidebar.users"), icon: Users, roles: ["Admin"] },
    { href: "/dashboard/products", label: t("sidebar.products"), icon: Package, roles: ["Admin", "Manager", "User"] },
    {
      href: "/dashboard/marketplace",
      label: t("sidebar.marketplace"),
      icon: ShoppingBag,
      roles: ["Admin", "Manager", "User"],
    },
    { href: "/dashboard/vendors", label: t("sidebar.vendors"), icon: Building2, roles: ["Admin", "Manager", "User"] },
    {
      href: "/dashboard/messages",
      label: t("sidebar.messages"),
      icon: MessageSquare,
      roles: ["Admin", "Manager", "User"],
      badge: 3,
    },
    { href: "/dashboard/meetings", label: t("sidebar.meetings"), icon: CalendarDays, roles: ["Admin", "Manager", "User"] },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  // Debounced hover handlers to prevent rapid state changes
  const debouncedSetHovered = useCallback(
    debounce((hovered: boolean) => {
      setIsHovered(hovered)
    }, 50),
    [],
  )

  const handleMouseEnter = useCallback(() => {
    debouncedSetHovered(true)
  }, [debouncedSetHovered])

  const handleMouseLeave = useCallback(() => {
    debouncedSetHovered(false)
  }, [debouncedSetHovered])

  if (!mounted) {
    return (
      <div className="fixed left-0 top-[120px] z-40 h-[calc(100vh-120px)] w-16 bg-sidebar border-r border-sidebar-border">
        <div className="flex h-full flex-col">
          <div className="p-2">
            <div className="w-full h-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-[120px] z-40 h-[calc(100vh-120px)] bg-sidebar border-r border-sidebar-border",
        "transition-all duration-300 ease-in-out transform-gpu",
        "will-change-[width]",
        isHovered ? "w-64" : "w-16",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        contain: "layout style paint",
      }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="p-2">
          <div className={cn(
            "flex items-center w-full transition-all duration-300",
            isHovered ? "gap-2" : "justify-center"
          )}>
            {companyLogo ? (
              <Image
                src={companyLogo || "/placeholder.svg"}
                alt={`${companyName || 'Company'} logo`}
                width={32}
                height={32}
                className="rounded-sm flex-shrink-0"
              />
            ) : (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(companyName)}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "flex flex-col items-start truncate min-w-0 transition-all duration-300",
                isHovered ? "opacity-100 w-auto ml-2" : "opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-sm font-semibold truncate">{companyName || 'Company'}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <nav className="space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                    )}
                    title={!isHovered ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <div
                      className={cn(
                        "flex items-center justify-between w-full transition-all duration-300",
                        isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border">
          <nav className="space-y-1">
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname.startsWith("/dashboard/settings")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
              )}
              title={!isHovered ? t("sidebar.settings") : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "truncate transition-all duration-300",
                  isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
                )}
              >
                {t("sidebar.settings")}
              </span>
            </Link>
            <button
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground",
              )}
              title={!isHovered ? t("nav.logout") : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "truncate transition-all duration-300",
                  isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
                )}
              >
                {t("nav.logout")}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
