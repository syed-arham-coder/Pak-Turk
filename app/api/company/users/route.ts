import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

// GET: /api/company/users?companyId=1
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId")
  console.log("Fetching users for companyId:", companyId)
  
  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 })
  }

  try {
    console.log("Executing query for companyId:", companyId)
    const users = await query(
      `SELECT 
        u.id, 
        u.full_name AS name,
        u.email, 
        u.role, 
        'Active' AS status,
        u.full_name,
        u.phone
      FROM users u
      JOIN user_companies uc ON u.id = uc.user_id
      WHERE uc.company_id = ?`,
      [companyId]
    )
    console.log("Query result:", users)
    return NextResponse.json(users)
  } catch (err: any) {
    console.error("Error fetching users:", err)
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 })
  }
}

// POST: /api/company/users
export async function POST(req: NextRequest) {
  try {
    const { email, fullName, phone, role, companyId, password } = await req.json()
    if (!email || !fullName || !phone || !role || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use provided password or generate a random one
    const userPassword = password || Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(userPassword, 10)

    // Insert user
    const userResult = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, fullName, phone, role]
    )
    const userId = userResult.insertId || (userResult[0] && userResult[0].insertId)

    // Link user to company
    await query(
      `INSERT INTO user_companies (user_id, company_id, is_primary) VALUES (?, ?, 0)`,
      [userId, companyId]
    )

    // Return the created user (without password)
    return NextResponse.json({
      id: userId,
      email,
      fullName,
      phone,
      role,
      status: "Active"
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 })
  }
}

// PUT: /api/company/users
export async function PUT(req: NextRequest) {
  try {
    const { id, fullName, email, phone, role, status, currentUserId, currentUserRole } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }
    // Prevent user from changing their own role
    if (id === currentUserId && role !== currentUserRole) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 403 })
    }
    // Update user details
    await query(
      `UPDATE users 
       SET full_name = ?, 
           email = ?, 
           phone = ?, 
           role = ?
       WHERE id = ?`,
      [fullName, email, phone, role, id]
    )
    return NextResponse.json({ message: "User updated successfully" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 })
  }
}

// DELETE: /api/company/users
export async function DELETE(req: NextRequest) {
  try {
    const { id, currentUserId } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }
    if (id === currentUserId) {
      return NextResponse.json({ error: "You cannot delete yourself." }, { status: 403 })
    }
    // Delete user-company relationship first (due to foreign key constraint)
    await query(
      `DELETE FROM user_companies WHERE user_id = ?`,
      [id]
    )
    // Then delete the user
    await query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    )
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "DB error" }, { status: 500 })
  }
}
