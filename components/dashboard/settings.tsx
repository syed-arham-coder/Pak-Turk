"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  UserCircle,
  Bell,
  Palette,
  ShieldCheck,
  Globe,
  DollarSign,
  Save,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"

interface UserSettings {
  name: string
  email: string
  receiveNotifications: boolean
  notificationSound: boolean
  preferredLanguage: "en" | "es" | "fr"
  preferredCurrency: "USD" | "EUR" | "GBP"
  interfaceTheme: "light" | "dark" | "system"
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme, language, setLanguage, currency, setCurrency, mounted } = useAppContext()
  const { toast } = useToast()

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: user?.name || "",
    email: user?.email || "",
    receiveNotifications: true,
    notificationSound: false,
    preferredLanguage: language,
    preferredCurrency: currency,
    interfaceTheme: (theme === "system"
      ? "system"
      : theme === "dark"
        ? "dark"
        : "light") as UserSettings["interfaceTheme"],
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setUserSettings((prev) => ({ ...prev, [key]: value }))
    if (key === "preferredLanguage") setLanguage(value)
    if (key === "preferredCurrency") setCurrency(value)
    if (key === "interfaceTheme") {
      setTheme(value)
    }
  }

  const handleProfileSave = () => {
    console.log("Saving profile settings:", { name: userSettings.name, email: userSettings.email })
    toast({ title: "Profile Updated", description: "Your profile information has been saved." })
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters long.", variant: "destructive" })
      return
    }
    console.log("Changing password for:", user?.email, "New password:", newPassword)
    toast({ title: "Password Changed", description: "Your password has been updated successfully." })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  if (!user || !mounted) return <p>Loading settings...</p>

  return (
    <div className="container mx-auto py-2 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="mr-3 h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account, preferences, and platform settings.</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5 text-primary" /> Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={userSettings.name} onChange={(e) => handleSettingChange("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userSettings.email}
              onChange={(e) => handleSettingChange("email", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleProfileSave}>
            <Save className="mr-2 h-4 w-4" /> Save Profile
          </Button>
        </CardFooter>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Security Settings
          </CardTitle>
          <CardDescription>Manage your password and account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleChangePassword}>Change Password</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
