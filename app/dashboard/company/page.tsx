"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import {
  Building,
  Edit3,
  ImageIcon,
  Save,
  UploadCloud,
  Bug,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { useState, type ChangeEvent, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"

// Add these imports at the top
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { companySchema, type CompanyFormValues } from "@/lib/validators/company-schema"
// Add this import at the top
import { compressImageToBase64, isValidImageFile, isValidFileSize } from "@/lib/image-utils"

// Explicitly type initialCompanyDataStructure
const initialCompanyDataStructure: CompanyFormValues = {
  id: null,
  name: "",
  address: "",
  website: "",
  business_type: "other",
  company_type: "other",
  trade_association_member: false,
  city: "",
  country: "",
  profile_photo: "",
  company_description: "",
  default_language: "en",
  currency: "USD",
  email: "",
  industry: "",
  phone: "",
  created_at: "",
  updated_at: "",
}

// Replace the CompanyProfilePage function with this updated version
export default function CompanyProfilePage() {
  const { user } = useAuth()
  const { t } = useAppContext()
  const { toast } = useToast()

  console.log("CompanyProfilePage - Full user object:", user)
  console.log("CompanyProfilePage - user.companyId:", user?.companyId)
  console.log("CompanyProfilePage - user.role:", user?.role)

  const [isEditing, setIsEditing] = useState(false)
  // Explicitly type companyData state
  const [companyData, setCompanyData] = useState<CompanyFormValues>(initialCompanyDataStructure)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Explicitly type useForm as CompanyFormValues
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
    defaultValues: initialCompanyDataStructure,
    mode: "onChange",
  })

  // Add debug function
  const handleDebug = () => {
    console.log("=== DEBUG INFO ===")
    console.log("User object:", user)
    console.log("User companyId:", user?.companyId)
    console.log("User companyId type:", typeof user?.companyId)
    console.log("localStorage b2b-user:", localStorage.getItem("b2b-user"))
    console.log("Company data:", companyData)
    console.log("Form values:", form.getValues())
    console.log("=== END DEBUG ===")

    toast({
      title: "Debug Info",
      description: `User ID: ${user?.id}, Company ID: ${user?.companyId}, Role: ${user?.role}`,
    })
  }

  useEffect(() => {
    const fetchCompanyData = async () => {
      console.log("fetchCompanyData called with user:", user)

      if (!user) {
        console.log("No user found, stopping fetch")
        setIsLoading(false)
        return
      }

      if (typeof user.companyId === "undefined" || user.companyId === null) {
        console.log("No companyId found for user:", user.companyId)
        setIsLoading(false)
        setError("No company ID found for the current user. Please contact support.")
        return
      }

      setError(null)

      try {
        console.log("Fetching company data for companyId:", user.companyId)
        const response = await fetch(`/api/company?companyId=${user.companyId.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch company data")
        }

        const data = await response.json()
        console.log("Fetched company data:", data)

        // Map API data to frontend state structure, ensuring no null values
        const formattedData: CompanyFormValues = {
          id: data.id ?? null,
          name: data.name || "",
          address: data.address || "",
          website: data.website || "",
          business_type: data.business_type || "other",
          company_type: data.company_type || "other",
          trade_association_member: Boolean(data.trade_association_member),
          city: data.city || "",
          country: data.country || "",
          profile_photo: data.profile_photo || "",
          company_description: data.company_description || "",
          default_language: data.default_language || "en",
          currency: data.currency || "USD",
          email: data.email || "",
          industry: data.industry || "",
          phone: data.phone || "",
          created_at: data.created_at?.toString() || "",
          updated_at: data.updated_at?.toString() || "",
        }

        console.log("Formatted company data:", formattedData)
        setCompanyData(formattedData)
        setLogoPreview(data.profile_photo || "")

        // Reset form with fetched data
        form.reset(formattedData)
        console.log("Form reset with data")
      } catch (err: any) {
        console.error("Error fetching company data:", err)
        setError(err.message || "An error occurred while fetching company data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyData()
  }, [user, form.reset])

  // Replace the handleLogoChange function with this updated version
  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type and size
      if (!isValidImageFile(file)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid image file (JPG, PNG, GIF, WEBP)",
          variant: "destructive",
        })
        return
      }

      if (!isValidFileSize(file, 2)) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        })
        return
      }

      try {
        // Compress and convert to base64
        const base64 = await compressImageToBase64(file, 800, 800, 0.8)
        setLogoPreview(base64)
        form.setValue("profile_photo", base64)
      } catch (error) {
        console.error("Error processing image:", error)
        toast({
          title: "Image processing failed",
          description: "Failed to process the uploaded image",
          variant: "destructive",
        })
      }
    }
  }

  const onSubmit = async (values: CompanyFormValues) => {
    console.log("onSubmit called with values:", values)
    console.log("Current user in onSubmit:", user)

    setIsSaving(true)
    setError(null)

    if (!user) {
      setError("User not authenticated.")
      setIsSaving(false)
      return
    }

    if (!user.companyId) {
      setError("Company ID not found for the current user.")
      setIsSaving(false)
      return
    }

    // Prepare data for API
    const dataToSave = {
      ...values,
      id: user.companyId,
    }

    console.log("Data to save:", dataToSave)

    try {
      const response = await fetch("/api/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      })

      const result = await response.json()
      console.log("Save response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to save company data")
      }

      toast({ title: "Profile Updated", description: "Company details saved successfully." })
      setIsEditing(false)

      // Update the company data state
      setCompanyData({
        ...companyData,
        ...values,
        updated_at: new Date().toISOString(),
      })
    } catch (err: any) {
      console.error("Error saving company data:", err)
      setError(err.message || "An error occurred while saving company data.")
      toast({
        title: "Save Failed",
        description: err.message || "Failed to save company details.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading company data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-2">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">Error: {error}</p>
              <div className="space-x-2">
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Button variant="outline" onClick={handleDebug}>
                  <Bug className="mr-2 h-4 w-4" />
                  Debug Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-2">
        <Card>
          <CardContent className="py-8">
            <p className="text-center">User not authenticated.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admins and Managers can edit
  const canEdit = user.role === "Admin" || user.role === "Manager"

  return (
    <div className="container mx-auto py-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
              <Building className="mr-2 h-6 w-6 text-primary" /> Company Profile
            </CardTitle>
            <CardDescription>Manage your company&apos;s information and branding.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDebug}>
              <Bug className="mr-2 h-4 w-4" />
              Debug
            </Button>
            {canEdit && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                disabled={isSaving}
              >
                {isSaving ? (
                  "Saving..."
                ) : isEditing ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <Edit3 className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            )}
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <Label htmlFor="logoUpload" className={isEditing ? "cursor-pointer" : ""}>
                    <div className="relative h-32 w-32 rounded-lg border border-dashed flex items-center justify-center bg-muted hover:border-primary transition-colors">
                      {logoPreview ? (
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Company Logo"
                          layout="fill"
                          objectFit="contain"
                          className="rounded-lg p-1"
                        />
                      ) : (
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      )}
                      {isEditing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <UploadCloud className="h-8 w-8 text-white" />
                          <span className="text-xs text-white mt-1">Change Logo</span>
                        </div>
                      )}
                    </div>
                  </Label>
                  {isEditing && (
                    <Input
                      id="logoUpload"
                      type="file"
                      className="hidden"
                      onChange={handleLogoChange}
                      accept="image/*"
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="trader">Trader</SelectItem>
                            <SelectItem value="service">Service Provider</SelectItem>
                            <SelectItem value="exporter">Exporter</SelectItem>
                            <SelectItem value="importer">Importer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">Private Limited</SelectItem>
                            <SelectItem value="public">Public Limited</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="proprietorship">Proprietorship</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade_association_member"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!isEditing} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Trade Association Member</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" disabled={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={!isEditing} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="default_language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Timestamps */}
              {!isEditing && companyData.created_at && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                  <div>
                    <p>Created At: {new Date(companyData.created_at).toLocaleString()}</p>
                  </div>
                  {companyData.updated_at && companyData.updated_at !== companyData.created_at && (
                    <div>
                      <p>Updated At: {new Date(companyData.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="border-t pt-6">
                <Button type="submit" className="ml-auto" disabled={isSaving || !form.formState.isValid}>
                  {isSaving ? "Saving..." : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
              </CardFooter>
            )}
          </form>
        </Form>
      </Card>
    </div>
  )
}
