import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const businessType = searchParams.get("business_type") || ""
    const companyType = searchParams.get("company_type") || ""
    const country = searchParams.get("country") || ""
    const industry = searchParams.get("industry") || ""

    let sql = `
      SELECT 
        id,
        name,
        address,
        website,
        business_type,
        company_type,
        trade_association_member,
        city,
        country,
        created_at,
        updated_at,
        profile_photo,
        company_description,
        email,
        industry,
        phone
      FROM companies 
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (name LIKE ? OR company_description LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    if (businessType) {
      sql += ` AND business_type = ?`
      params.push(businessType)
    }

    if (companyType) {
      sql += ` AND company_type = ?`
      params.push(companyType)
    }

    if (country) {
      sql += ` AND country LIKE ?`
      params.push(`%${country}%`)
    }

    if (industry) {
      sql += ` AND industry LIKE ?`
      params.push(`%${industry}%`)
    }

    sql += ` ORDER BY created_at DESC`

    const companies = await query(sql, params)

    // Convert profile_photo blob to base64 if it exists
    const companiesWithImages = companies.map((company: any) => ({
      ...company,
      profile_photo: company.profile_photo 
        ? `data:image/jpeg;base64,${Buffer.from(company.profile_photo).toString('base64')}`
        : null
    }))

    return NextResponse.json({
      success: true,
      companies: companiesWithImages
    })

  } catch (error: any) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}
