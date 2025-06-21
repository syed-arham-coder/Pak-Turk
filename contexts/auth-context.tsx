"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// Define types for user and company
export type UserRole = "Admin" | "Manager" | "User"

interface User {
  id: number
  email: string
  fullName: string
  role: UserRole
  companyId: number
  companyName: string
  permissions?: string[]
  profile_photo?: string | null
  company_description?: string | null
  default_language?: string
  currency?: string
  business_type?: string | null
  company_type?: string | null
  trade_association_member?: boolean
  city?: string | null
  country?: string | null
  created_at?: string
  updated_at?: string
  industry?: string | null
  phone?: string | null
}

interface AuthContextType {
  user: User | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  loading: boolean
  hasPermission: (permission: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data with proper companyId
const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@companya.com",
    fullName: "Alice Admin",
    role: "Admin",
    companyId: 1,
    companyName: "Company A Solutions",
  },
  {
    id: 2,
    email: "manager@companyb.com",
    fullName: "Bob Manager",
    role: "Manager",
    companyId: 2,
    companyName: "Company B Innovations",
  },
  {
    id: 3,
    email: "user@companya.com",
    fullName: "Charlie User",
    role: "User",
    companyId: 1,
    companyName: "Company A Solutions",
  },
]

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("AuthProvider useEffect running")
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("b2b-user")
    console.log("Stored user from localStorage:", storedUser)

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("Parsed stored user:", parsedUser)

        // Validate that the user has required fields
        if (parsedUser && parsedUser.id && parsedUser.companyId) {
          // Load permissions for stored user
          loadUserPermissions(parsedUser)
        } else {
          console.log("Stored user missing required fields, clearing localStorage")
          localStorage.removeItem("b2b-user")
          setLoading(false)
        }
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("b2b-user")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const loadUserPermissions = async (userData: User) => {
    console.log("loadUserPermissions called with userData:", userData)

    // Validate userData has companyId
    if (!userData.companyId) {
      console.error("User data missing companyId:", userData)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/permissions?role=${userData.role}`)
      if (!response.ok) {
        // Instead of parsing error JSON, just log a simple error message
        console.error("Failed to fetch permissions: Server error or too many connections.")
        // Set default permissions based on role if API fails
        const defaultPermissions = {
          Admin: [
            "manage_users",
            "manage_roles",
            "manage_company",
            "manage_products",
            "manage_vendors",
            "view_dashboard",
            "manage_settings",
          ],
          Manager: ["manage_products", "manage_vendors", "view_dashboard", "manage_settings"],
          User: ["view_dashboard", "view_products", "view_vendors"],
        }

        const userWithDefaultPermissions = {
          ...userData,
          permissions: defaultPermissions[userData.role as keyof typeof defaultPermissions],
        }

        setUser(userWithDefaultPermissions)
        localStorage.setItem("b2b-user", JSON.stringify(userWithDefaultPermissions))
        setLoading(false)
        return
      }

      const data = await response.json()
      const userWithPermissions = {
        ...userData,
        permissions: data.permissions.map((p: any) => p.permission),
      }

      setUser(userWithPermissions)
      localStorage.setItem("b2b-user", JSON.stringify(userWithPermissions))
    } catch (error) {
      // On any error, log a simple message and fall back to default permissions
      console.error("Error loading permissions: Server error or too many connections.")
      const defaultPermissions = {
        Admin: [
          "manage_users",
          "manage_roles",
          "manage_company",
          "manage_products",
          "manage_vendors",
          "view_dashboard",
          "manage_settings",
        ],
        Manager: ["manage_products", "manage_vendors", "view_dashboard", "manage_settings"],
        User: ["view_dashboard", "view_products", "view_vendors"],
      }

      const userWithDefaultPermissions = {
        ...userData,
        permissions: defaultPermissions[userData.role as keyof typeof defaultPermissions],
      }

      setUser(userWithDefaultPermissions)
      localStorage.setItem("b2b-user", JSON.stringify(userWithDefaultPermissions))
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    console.log("Login called with credentials:", { ...credentials, password: "[REDACTED]" })
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()
      console.log("Login response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Validate that the response contains user data with companyId
      if (!data.user || !data.user.companyId) {
        console.error("Login response missing user or companyId:", data)
        throw new Error("Invalid user data received from server")
      }

      // Load permissions for the logged-in user
      console.log("Loading permissions for logged-in user:", data.user)
      await loadUserPermissions(data.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setLoading(false)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("b2b-user")
    router.push("/")
  }

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!user?.role || !user?.permissions) return false
    return user.permissions.includes(permission)
  }

  return <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>{children}</AuthContext.Provider>
}
