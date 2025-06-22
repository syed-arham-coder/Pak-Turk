"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface AppContextType {
  mounted: boolean
  t: (key: string) => string
}

const translations = {
  "sidebar.dashboard": "Dashboard",
  "sidebar.products": "My Products",
  "sidebar.meetings": "Meetings",
  "sidebar.messages": "Messages",
  "sidebar.reports": "Reports",
  "sidebar.documents": "Documents",
  "sidebar.settings": "Settings",
  "sidebar.admin": "Admin",
  "sidebar.users": "User Management",
  "sidebar.companies": "Manage Companies",
  "nav.logout": "Logout",
  "sidebar.marketplace": "Marketplace",
  "sidebar.vendors": "Vendor Directory",
  "dashboard.welcome": "Welcome",
  "dashboard.overview": "Here's an overview of your company dashboard.",
  "dashboard.total_revenue": "Total Revenue",
  "dashboard.from_last_month": "from last month",
  "dashboard.subscriptions": "Subscriptions",
  "dashboard.sales": "Sales",
  "dashboard.active_now": "Active Now",
  "dashboard.since_last_hour": "since last hour",
  "dashboard.recentActivity": "Recent Activity",
  "dashboard.recentActivity.description": "See what's happening in your company.",
  "dashboard.activity.newProduct": "New product added: {{product}} by {{company}}.",
  "dashboard.activity.meetingRequest": "New meeting request from {{company}}.",
  "dashboard.activity.userLogin": "User {{user}} logged in.",
  "dashboard.activity.messageReceived": "Message received from {{team}} at {{company}}.",
  "dashboard.activity.timeAgo": "{{time}} ago",
  "dashboard.viewAllActivity": "View All Activity",
  "dashboard.quickActions": "Quick Actions",
  "dashboard.quickActions.description": "Perform common tasks quickly.",
  "dashboard.actions.addProduct": "Add Product",
  "dashboard.actions.addProduct.description": "Add a new product to your catalog.",
  "dashboard.actions.scheduleMeeting": "Schedule Meeting",
  "dashboard.actions.scheduleMeeting.description": "Arrange a new meeting with your team or partners.",
  "dashboard.actions.inviteUser": "Invite User",
  "dashboard.actions.inviteUser.description": "Invite a new user to your company.",
  "dashboard.actions.viewMessages": "View Messages",
  "dashboard.actions.viewMessages.description": "Check your latest messages.",
}

const AppContext = createContext<AppContextType>({
  mounted: false,
  t: (key: string) => key,
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const t = (key: string) => {
    return translations[key] || key
  }

  return (
    <AppContext.Provider value={{ mounted, t }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
