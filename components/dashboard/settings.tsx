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

  const handleNotificationSave = () => {
    console.log("Saving notification settings:", {
      receive: userSettings.receiveNotifications,
      sound: userSettings.notificationSound,
    })
    toast({ title: "Notifications Updated", description: "Notification preferences saved." })
  }

  const handlePreferencesSave = () => {
    console.log("Saving preferences:", {
      lang: userSettings.preferredLanguage,
      curr: userSettings.preferredCurrency,
      theme: userSettings.interfaceTheme,
    })
    toast({ title: "Preferences Updated", description: "Language, currency, and theme preferences saved." })
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

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" /> Notification Settings
          </CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="receiveNotifications" className="flex flex-col space-y-1">
              <span>Receive Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get notified about new messages, meeting requests, etc.
              </span>
            </Label>
            <Switch
              id="receiveNotifications"
              checked={userSettings.receiveNotifications}
              onCheckedChange={(checked) => handleSettingChange("receiveNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notificationSound" className="flex flex-col space-y-1">
              <span>Enable Notification Sounds</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Play a sound for new notifications in the app.
              </span>
            </Label>
            <Switch
              id="notificationSound"
              checked={userSettings.notificationSound}
              onCheckedChange={(checked) => handleSettingChange("notificationSound", checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNotificationSave}>
            <Save className="mr-2 h-4 w-4" /> Save Notifications
          </Button>
        </CardFooter>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5 text-primary" /> Preferences
          </CardTitle>
          <CardDescription>Customize your platform experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={userSettings.preferredLanguage}
                onValueChange={(value) =>
                  handleSettingChange("preferredLanguage", value as UserSettings["preferredLanguage"])
                }
              >
                <SelectTrigger id="language">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={userSettings.preferredCurrency}
                onValueChange={(value) =>
                  handleSettingChange("preferredCurrency", value as UserSettings["preferredCurrency"])
                }
              >
                <SelectTrigger id="currency">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Interface Theme</Label>
              <Select
                value={userSettings.interfaceTheme}
                onValueChange={(value) =>
                  handleSettingChange("interfaceTheme", value as UserSettings["interfaceTheme"])
                }
              >
                <SelectTrigger id="theme">
                  <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System Default
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePreferencesSave}>
            <Save className="mr-2 h-4 w-4" /> Save Preferences
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
