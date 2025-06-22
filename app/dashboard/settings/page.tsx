"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { Settings, UserCircle, Bell, Palette, ShieldCheck, Globe, DollarSign, Save } from "lucide-react"
import { useTheme } from "next-themes"
import { UserCircle as UserCircleIcon } from "lucide-react"

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
  const {
    theme: currentAppContextTheme,
    setTheme: setAppContextTheme,
    language,
    setLanguage,
    currency,
    setCurrency,
  } = useAppContext()
  const { setTheme: setNextTheme } = useTheme() // For next-themes actual theme changing
  const { toast } = useToast()

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: user?.name || "",
    email: user?.email || "",
    receiveNotifications: true,
    notificationSound: false,
    preferredLanguage: language,
    preferredCurrency: currency,
    interfaceTheme: (currentAppContextTheme === "system"
      ? "system"
      : currentAppContextTheme === "dark"
        ? "dark"
        : "light") as UserSettings["interfaceTheme"],
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [imageKey, setImageKey] = useState(Date.now()) // for cache-busting

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setUserSettings((prev) => ({ ...prev, [key]: value }))
    if (key === "preferredLanguage") setLanguage(value)
    if (key === "preferredCurrency") setCurrency(value)
    if (key === "interfaceTheme") {
      setAppContextTheme(value) // Update context
      setNextTheme(value) // Update next-themes
    }
  }

  const handleProfileSave = async () => {
    try {
      const res = await fetch("/api/auth/change-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          newName: userSettings.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.message || "Failed to update name.", variant: "destructive" })
        return
      }
      toast({ title: "Profile Updated", description: data.message || "Your profile information has been saved." })
      // Optionally update user context here if needed
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    }
  }

  const handleNotificationSave = () => {
    // Simulate API call to save notification settings
    console.log("Saving notification settings:", {
      receive: userSettings.receiveNotifications,
      sound: userSettings.notificationSound,
    })
    toast({ title: "Notifications Updated", description: "Notification preferences saved." })
  }

  const handlePreferencesSave = () => {
    // Simulate API call to save preferences
    console.log("Saving preferences:", {
      lang: userSettings.preferredLanguage,
      curr: userSettings.preferredCurrency,
      theme: userSettings.interfaceTheme,
    })
    toast({ title: "Preferences Updated", description: "Language, currency, and theme preferences saved." })
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters long.", variant: "destructive" })
      return
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.message || "Failed to change password.", variant: "destructive" })
        return
      }
      toast({ title: "Password Changed", description: data.message || "Your password has been updated successfully." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return
    const formData = new FormData()
    formData.append("userId", String(user?.id || ""))
    formData.append("profilePicture", profilePicture)
    const res = await fetch("/api/auth/upload-profile-picture", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    toast({ title: data.message })
    setProfilePicture(null)
    setImageKey(Date.now()) // update to force reload
  }

  if (!user) return <p>Loading settings...</p>

  return (
    <div className="container mx-auto py-2 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="mr-3 h-8 w-8 text-primary" />
          Settings
        </h1>
        <br />
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
          <div className="flex flex-col items-start space-y-2">
            <Label>Profile Picture</Label>
            <div className="relative">
              <button type="button" onClick={handleAvatarClick} className="focus:outline-none">
                <img
                  src={`/api/auth/profile-picture?userId=${user?.id}&t=${imageKey}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                />
              </button>
              <input
                ref={fileInputRef}
                id="profilePicture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>
            {profilePicture && (
              <Button size="sm" className="mt-2" onClick={handleProfilePictureUpload}>Upload Picture</Button>
            )}
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={userSettings.name} placeholder={user?.fullName || "Full Name"} onChange={(e) => handleSettingChange("name", e.target.value)} />
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
