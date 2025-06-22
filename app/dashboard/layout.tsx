"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import Header from "@/components/layout/header"
import { useAuth } from "@/contexts/auth-context"
import { redirect } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content with Sidebar */}
      <div className="flex h-[calc(100vh-var(--header-height,120px))]"> {/* Dynamic header height */}
        <AppSidebar userRole={user.role} companyName={user.companyName} companyLogo={user.companyLogo} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 ml-16 transition-all duration-300">{children}</main>
      </div>
    </div>
  )
}
