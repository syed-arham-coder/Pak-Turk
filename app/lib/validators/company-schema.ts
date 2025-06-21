import { z } from "zod"

export const companySchema = z.object({
  id: z.number().nullable(),
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  business_type: z.enum(["manufacturer", "trader", "service", "exporter", "importer", "other"]),
  company_type: z.enum(["private", "public", "partnership", "proprietorship", "government", "other"]),
  trade_association_member: z.boolean(),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  profile_photo: z.string().optional(),
  company_description: z.string().min(10, "Description must be at least 10 characters"),
  default_language: z.string(),
  currency: z.string(),
  email: z.string().email("Please enter a valid email address"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  created_at: z.string(),
  updated_at: z.string(),
})

export type CompanyFormValues = z.infer<typeof companySchema>
