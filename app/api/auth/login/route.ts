import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log("Login attempt:", { email, password: "[REDACTED]" })

    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Query to find user with company information through user_companies junction table
    const userQuery = `
      SELECT 
        u.id, u.email, u.full_name as fullName, 
        u.role, u.password_hash, uc.company_id as companyId, u.created_at, u.updated_at,
        c.name as companyName
      FROM users u
      JOIN user_companies uc ON u.id = uc.user_id
      JOIN companies c ON uc.company_id = c.id
      WHERE u.email = ?
    `

    console.log("Executing user query with:", { email })

    const users: any[] = await query(userQuery, [email])

    console.log("Query result:", users)

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Remove password_hash from user object before sending response
    const { password_hash, ...userWithoutPassword } = user

    // Return user data with companyId
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }

    console.log("Returning user data:", userData)

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}
