import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

// GET /api/users - Get all users for chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get('currentUserId')
    const search = searchParams.get('search') || ''

    if (!currentUserId) {
      return NextResponse.json({ error: 'Current user ID is required' }, { status: 400 })
    }

    const [users] = await execute(
      `SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.last_login,
        CASE 
          WHEN u.last_login > DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 1
          ELSE 0
        END as is_online
       FROM users u
       WHERE u.id != ? 
       AND u.status = 'Active'
       AND (u.full_name LIKE ? OR u.email LIKE ?)
       ORDER BY is_online DESC, u.full_name ASC`,
      [currentUserId, `%${search}%`, `%${search}%`]
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
