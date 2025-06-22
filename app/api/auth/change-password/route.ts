import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { compare, hash } from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const conn = await getConnection();
    try {
      // Fetch user by id
      const [users]: any = await conn.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        conn.release();
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      const user = users[0];
      // Verify current password
      const isValid = await compare(currentPassword, user.password_hash);
      if (!isValid) {
        conn.release();
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
      }
      // Hash new password
      const newHash = await hash(newPassword, 12);
      await conn.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
      conn.release();
      return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
      conn.release();
      throw error;
    }
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 