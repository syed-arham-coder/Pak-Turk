"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Building, Phone, Lock, MapPin, Globe, CheckCircle, Users, Shield } from "lucide-react"

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  fullName: z.string().min(1, { message: "Full name is required." }),
  countryCode: z.string().min(1, { message: "Country code is required." }),
  areaCode: z.string().min(1, { message: "Area code is required." }),
  phoneNumber: z.string().min(5, { message: "Phone number is required." }),
  landlineCountryCode: z.string().min(1, { message: "Landline country code is required." }),
  landlineAreaCode: z.string().min(1, { message: "Landline area code is required." }),
  landlineNumber: z.string().min(5, { message: "Landline number is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Confirm your password." }),
  companyName: z.string().min(1, { message: "Company name is required." }),
  companyAddress: z.string().min(1, { message: "Company address is required." }),
  companyWebsite: z.string().url({ message: "Invalid website URL.Try Adding Protocol (https:// or http://)" }).optional().or(z.literal("").transform(() => undefined)),
  businessType: z.string().min(1, { message: "Business type is required." }),
  companyType: z.string().min(1, { message: "Company type is required." }),
  tradeAssociationMember: z.string().min(1, { message: "Please select an option." }),
  city: z.string().min(1, { message: "City is required." }),
  country: z.string().min(1, { message: "Country is required." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { toast } = useToast()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      countryCode: "",
      areaCode: "",
      phoneNumber: "",
      landlineCountryCode: "",
      landlineAreaCode: "",
      landlineNumber: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      companyAddress: "",
      companyWebsite: "",
      businessType: "",
      companyType: "",
      tradeAssociationMember: "",
      city: "",
      country: "",
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setFormError(null)
    setIsSubmitting(true)
    try {
      // Concatenate phone fields
      const phone = `${data.countryCode}-${data.areaCode}-${data.phoneNumber}`
      const landline = `${data.landlineCountryCode}-${data.landlineAreaCode}-${data.landlineNumber}`
      
      // Create a new payload without the individual phone fields
      const { 
        countryCode, 
        areaCode, 
        phoneNumber,
        landlineCountryCode,
        landlineAreaCode,
        landlineNumber,
        ...restData 
      } = data
      
      const payload = {
        ...restData,
        phone,
        landline,
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      })
      form.reset()
      // Redirect to login page after successful registration
      window.location.href = '/login';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setFormError(errorMessage)
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl xl:max-w-5xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 overflow-x-auto">
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Pak-Turk Trade</CardTitle>
          <p className="text-gray-600 text-sm sm:text-base">Register Your Company</p>
        </CardHeader>
        <CardContent>
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Team Management</p>
                <p className="text-xs text-muted-foreground">Manage your team efficiently</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Secure Platform</p>
                <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Global Reach</p>
                <p className="text-xs text-muted-foreground">Connect worldwide</p>
              </div>
            </div>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information Card */}
              <div className="border-primary/20 shadow-lg bg-white rounded-lg p-4 sm:p-6 space-y-6 border border-gray-200 w-full col-span-1 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email Address*</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="example@company.com"
                      className="mt-1" 
                      {...form.register("email")} 
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name*</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Mark Dude"
                      className="mt-1" 
                      {...form.register("fullName")} 
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Phone Number*
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <Label htmlFor="countryCode" className="text-xs text-muted-foreground">Country</Label>
                      <Input
                        id="countryCode"
                        type="tel"
                        placeholder="+92"
                        autoComplete="tel-country-code"
                        className="text-sm"
                        {...form.register("countryCode")}
                      />
                      {form.formState.errors.countryCode && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.countryCode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="areaCode" className="text-xs text-muted-foreground">Area</Label>
                      <Input
                        id="areaCode"
                        type="tel"
                        placeholder="300"
                        autoComplete="tel-area-code"
                        className="text-sm"
                        {...form.register("areaCode")}
                      />
                      {form.formState.errors.areaCode && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.areaCode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="text-xs text-muted-foreground">Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="1234567"
                        autoComplete="tel-local"
                        className="text-sm"
                        {...form.register("phoneNumber")}
                      />
                      {form.formState.errors.phoneNumber && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Landline Number*
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <Label htmlFor="landlineCountryCode" className="text-xs text-muted-foreground">Country</Label>
                      <Input
                        id="landlineCountryCode"
                        type="tel"
                        placeholder="+92"
                        autoComplete="tel-country-code"
                        className="text-sm"
                        {...form.register("landlineCountryCode")}
                      />
                      {form.formState.errors.landlineCountryCode && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.landlineCountryCode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="landlineAreaCode" className="text-xs text-muted-foreground">Area</Label>
                      <Input
                        id="landlineAreaCode"
                        type="tel"
                        placeholder="021"
                        autoComplete="tel-area-code"
                        className="text-sm"
                        {...form.register("landlineAreaCode")}
                      />
                      {form.formState.errors.landlineAreaCode && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.landlineAreaCode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="landlineNumber" className="text-xs text-muted-foreground">Number</Label>
                      <Input
                        id="landlineNumber"
                        type="tel"
                        placeholder="1234567"
                        autoComplete="tel-local"
                        className="text-sm"
                        {...form.register("landlineNumber")}
                      />
                      {form.formState.errors.landlineNumber && (
                        <p className="text-xs text-destructive mt-1">{form.formState.errors.landlineNumber.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password*
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      className="mt-1" 
                      {...form.register("password")} 
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password*</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••"
                      className="mt-1" 
                      {...form.register("confirmPassword")} 
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information Card */}
              <div className="border-primary/20 shadow-lg bg-white rounded-lg p-4 sm:p-6 space-y-6 border border-gray-200 w-full col-span-1 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Company Information</h2>
                </div>
                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium">Company Full Name*</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Your Company Ltd."
                    className="mt-1" 
                    {...form.register("companyName")} 
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      City*
                    </Label>
                    <Input 
                      id="city" 
                      placeholder="Karachi"
                      className="mt-1" 
                      {...form.register("city")} 
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">Country*</Label>
                    <Input 
                      id="country" 
                      placeholder="Pakistan"
                      className="mt-1" 
                      {...form.register("country")} 
                    />
                    {form.formState.errors.country && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyAddress" className="text-sm font-medium">Company Address*</Label>
                  <Input 
                    id="companyAddress" 
                    placeholder="123 Business Street, City, Country"
                    className="mt-1" 
                    {...form.register("companyAddress")} 
                  />
                  {form.formState.errors.companyAddress && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.companyAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyWebsite" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Company Website
                  </Label>
                  <Input 
                    id="companyWebsite" 
                    placeholder="https://example.com" 
                    className="mt-1" 
                    {...form.register("companyWebsite")} 
                  />
                  {form.formState.errors.companyWebsite && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.companyWebsite.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType" className="text-sm font-medium">Business Type*</Label>
                    <Select value={form.watch("businessType")} onValueChange={val => form.setValue("businessType", val)}>
                      <SelectTrigger id="businessType" className="mt-1">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="trader">Trader</SelectItem>
                        <SelectItem value="service">Service Provider</SelectItem>
                        <SelectItem value="exporter">Exporter</SelectItem>
                        <SelectItem value="importer">Importer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.businessType && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.businessType.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="companyType" className="text-sm font-medium">Company Type*</Label>
                    <Select value={form.watch("companyType")} onValueChange={val => form.setValue("companyType", val)}>
                      <SelectTrigger id="companyType" className="mt-1">
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private Limited</SelectItem>
                        <SelectItem value="public">Public Limited</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="proprietorship">Proprietorship</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.companyType && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.companyType.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="tradeAssociationMember" className="text-sm font-medium">
                    Trade Association Membership*
                  </Label>
                  <Select value={form.watch("tradeAssociationMember")} onValueChange={val => form.setValue("tradeAssociationMember", val)}>
                    <SelectTrigger id="tradeAssociationMember" className="mt-1">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tradeAssociationMember && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.tradeAssociationMember.message}</p>
                  )}
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <Button 
                type="submit" 
                className="w-full sm:w-auto max-w-xs bg-red-500 hover:bg-red-600 text-white rounded-md font-medium text-base px-6 py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
          <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-primary hover:underline transition-colors">
              Login here
            </a>
          </p>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
