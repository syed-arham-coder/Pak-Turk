"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, LogIn } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login, loading } = useAuth()
  const { toast } = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null)
    try {
      await login({ 
        email: data.email, 
        password: data.password 
      })
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      setFormError(errorMessage)
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-6 px-2 sm:px-4">
      <div className="flex flex-col-reverse md:flex-row w-full max-w-5xl shadow-xl rounded-2xl overflow-hidden bg-white">
        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
          <Card className="w-full max-w-md mx-auto shadow-none border-0 bg-transparent">
            <CardHeader className="text-center space-y-2 p-0 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Pak-Turk Trade</CardTitle>
              <p className="text-gray-600 text-base">Log In Your Account</p>
            </CardHeader>
            <CardContent className="p-0">
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@xyz.com"
                    {...form.register("email")}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-base"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...form.register("password")}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-base"
                  />
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="#" className="text-sm text-teal-600 hover:text-teal-700">
                    Forgot Password?
                  </Link>
                </div>

                {formError && <p className="text-xs text-destructive">{formError}</p>}

                <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md font-medium text-base" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Log In
                </Button>

                <div className="text-center">
                  <span className="text-gray-500 text-xs">OR</span>
                </div>

                <div className="text-center">
                  <span className="text-gray-600 text-xs">
                    {"Don't have an account? "}
                    <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                      Register
                    </Link>
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Left side - Image Placeholder (hidden on mobile/small devices) */}
        <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-white p-8">
          <img
            src="/assets/login.png"
            alt="Login illustration"
            className="w-full max-w-lg h-auto object-cover"
          />
        </div>
      </div>
    </div>
  )
}
