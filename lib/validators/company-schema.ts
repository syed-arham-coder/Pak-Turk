import * as z from "zod"

export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(255),
  address: z.string().min(5, "Address is required"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  business_type: z.enum(["manufacturer", "trader", "service", "exporter", "importer", "other"]),
  company_type: z.enum(["private", "public", "partnership", "proprietorship", "government", "other"]),
  trade_association_member: z.boolean(),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  profile_photo: z.string().optional(),
  company_description: z.string().optional(),
  default_language: z.string().default("en"),
  currency: z.string().default("USD"),
  email: z.string().email("Please enter a valid email").or(z.string().length(0)),
  industry: z.string().optional(),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Please enter a valid phone number")
    .or(z.string().length(0)),
})

export type CompanyFormValues = z.infer<typeof companySchema>
