"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
  BarChart3,
  FileText,
  Home,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizeObserverSuppressor } from "@/components/resize-observer-suppressor"

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t, mounted } = useAppContext()
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const routes = [
    {
      label: t("sidebar.dashboard"),
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: t("sidebar.products"),
      icon: Package,
      href: "/dashboard/products",
      active: pathname === "/dashboard/products",
    },
    {
      label: t("sidebar.meetings"),
      icon: CalendarDays,
      href: "/dashboard/meetings",
      active: pathname === "/dashboard/meetings",
    },
    {
      label: t("sidebar.messages"),
      icon: MessageSquare,
      href: "/dashboard/messages",
      active: pathname === "/dashboard/messages",
    },
    {
      label: t("sidebar.reports"),
      icon: BarChart3,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
    {
      label: t("sidebar.documents"),
      icon: FileText,
      href: "/dashboard/documents",
      active: pathname === "/dashboard/documents",
    },
  ]

  const adminRoutes = [
    {
      label: t("sidebar.users"),
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
    },
    {
      label: t("sidebar.companies"),
      icon: Building2,
      href: "/dashboard/companies",
      active: pathname === "/dashboard/companies",
    },
  ]

  const settingsRoute = {
    label: t("sidebar.settings"),
    icon: Settings,
    href: "/dashboard/settings",
    active: pathname === "/dashboard/settings",
  }

  if (!mounted) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-16 bg-sidebar border-r border-sidebar-border">
        <div className="flex h-full flex-col">
          <div className="p-2">
            <div className="w-full h-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsHovered(false), 100)
    setHoverTimeout(timeout)
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isHovered ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user?.fullName || "User")}
                    </AvatarFallback>
                  </Avatar>
                  {isHovered && (
                    <div className="flex flex-col items-start truncate min-w-0 opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-semibold truncate">
                        {user?.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  )}
                  {isHovered && <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" side="right" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <nav className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
          {user?.role === "Admin" && (
            <div className="p-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {t("sidebar.admin")}
              </h2>
              <div className="space-y-1">
                {adminRoutes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="p-2">
            <div className="space-y-1">
              <Button
                variant={settingsRoute.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={settingsRoute.href}>
                  <settingsRoute.icon className="mr-2 h-4 w-4" />
                  {settingsRoute.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border">
          <nav className="space-y-1">
            <button
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground",
              )}
              title={!isHovered ? t("nav.logout") : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isHovered && (
                <span className="truncate opacity-100 transition-opacity duration-300">{t("nav.logout")}</span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
