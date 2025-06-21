import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      fullName,
      phone,
      password,
      // The following fields are not used in the users table, but may be used for company registration in the future
      // landline,
      // companyName,
      // companyAddress,
      // companyWebsite,
      // businessType,
      // companyType,
      // tradeAssociationMember,
      // city,
      // country,
    } = body;

    // Validate required fields
    if (!email || !fullName || !phone || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const conn = await getConnection();

    // Check if user already exists
    const [existingUsers]: any = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      conn.release();
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Insert user into database
    const [result]: any = await conn.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, fullName, phone, 'User', 'Active']
    );

    // Fetch the newly created user (without password)
    const [users]: any = await conn.query(
      'SELECT id, email, full_name, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );
    conn.release();

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: users[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
