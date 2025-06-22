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
      landline,
      password,
      companyName,
      companyAddress,
      companyWebsite,
      businessType,
      companyType,
      tradeAssociationMember,
      city,
      country,
    } = body;

    // Validate required fields
    if (!email || !fullName || !phone || !password || !companyName || !companyAddress || !businessType || !companyType || !tradeAssociationMember || !city || !country) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    try {
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

      // Check if company already exists (by name)
      const [existingCompanies]: any = await conn.query(
        'SELECT id FROM companies WHERE name = ?',
        [companyName]
      );
      if (existingCompanies.length > 0) {
        conn.release();
        return NextResponse.json(
          { message: 'Company with this name already exists' },
          { status: 400 }
        );
      }

      // Insert company
      const [companyResult]: any = await conn.query(
        `INSERT INTO companies (name, address, website, business_type, company_type, trade_association_member, city, country, landline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [companyName, companyAddress, companyWebsite || null, businessType, companyType, tradeAssociationMember === 'yes' ? 1 : 0, city, country, landline || null]
      );
      const companyId = companyResult.insertId;

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Insert user
      const [userResult]: any = await conn.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, fullName, phone, 'Admin', 'Active']
      );
      const userId = userResult.insertId;

      // Link user to company
      await conn.query(
        `INSERT INTO user_companies (user_id, company_id, is_primary) VALUES (?, ?, ?)`,
        [userId, companyId, 1]
      );

      // Fetch the newly created user (without password)
      const [users]: any = await conn.query(
        'SELECT id, email, full_name, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      // Fetch the newly created company
      const [companies]: any = await conn.query(
        'SELECT id, name, address, website, business_type, company_type, trade_association_member, city, country, landline, created_at, updated_at FROM companies WHERE id = ?',
        [companyId]
      );
      conn.release();

      return NextResponse.json(
        {
          message: 'User and company registered successfully',
          user: users[0],
          company: companies[0],
        },
        { status: 201 }
      );
    } catch (error) {
      conn.release();
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
