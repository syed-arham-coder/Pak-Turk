import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Fetch categories with product counts
    const categoriesQuery = `
      SELECT 
        c.id,
        c.name,
        c.picture,
        COUNT(p.id) as product_count
      FROM category c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.picture
      ORDER BY c.name ASC
    `

    const categories = await query(categoriesQuery)

    // Transform the data to include base64 image data
    const transformedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      image: category.picture ? `data:image/jpeg;base64,${Buffer.from(category.picture).toString('base64')}` : null,
      productCount: category.product_count || 0
    }))

    return NextResponse.json({
      success: true,
      categories: transformedCategories
    })
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch categories",
        error: error.message 
      },
      { status: 500 }
    )
  }
}
