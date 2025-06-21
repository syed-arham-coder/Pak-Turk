import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET: /api/company?companyId=1
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId")
  console.log("GET /api/company called with companyId:", companyId)

  if (!companyId) {
    console.log("Missing companyId in request")
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 })
  }

  try {
    console.log("Executing database query for companyId:", companyId)
    const rows: any[] = await query(
      `SELECT 
        id, name, address, website, business_type, company_type, 
        trade_association_member, city, country, created_at, updated_at, 
        profile_photo, company_description, default_language, currency,
        email, industry, phone
      FROM companies WHERE id = ? LIMIT 1`,
      [companyId],
    )

    console.log("Database query result:", rows)

    if (rows.length === 0) {
      console.log("No company found with id:", companyId)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    console.log("Returning company data:", rows[0])
    return NextResponse.json(rows[0])
  } catch (err: any) {
    console.error("Database error:", err)
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 })
  }
}

// PUT: /api/company
export async function PUT(req: NextRequest) {
  console.log("PUT /api/company called")

  const data = await req.json()
  console.log("PUT request data:", data)

  const {
    id,
    name,
    address,
    website,
    business_type,
    company_type,
    trade_association_member,
    city,
    country,
    profile_photo,
    company_description,
    default_language,
    currency,
    email,
    industry,
    phone,
  } = data

  if (!id) {
    console.log("Missing company id in PUT request")
    return NextResponse.json({ error: "Missing company id" }, { status: 400 })
  }

  console.log("Updating company with id:", id)

  try {
    const result = await query(
      `UPDATE companies SET
        name = ?, address = ?, website = ?, business_type = ?, 
        company_type = ?, trade_association_member = ?, city = ?, country = ?, 
        profile_photo = ?, company_description = ?, default_language = ?, currency = ?,
        email = ?, industry = ?, phone = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        name,
        address,
        website,
        business_type,
        company_type,
        trade_association_member,
        city,
        country,
        profile_photo,
        company_description,
        default_language,
        currency,
        email,
        industry,
        phone,
        id,
      ],
    )

    console.log("Update result:", result)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Update error:", err)
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 })
  }
}
