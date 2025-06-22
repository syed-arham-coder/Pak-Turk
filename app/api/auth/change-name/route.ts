i2port { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const { userId, newName } = await req.json();
    if (!userId || !newName) {
      return NextResponse.json({ message: 'Enter your full name' }, { status: 400 });
    }
    const conn = await getConnection();
    try {
      const [result]: any = await conn.query('UPDATE users SET full_name = ? WHERE id = ?', [newName, userId]);
      conn.release();
      if (result.affectedRows === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Name updated successfully' });
    } catch (error) {
      conn.release();
      throw error;
    }
  } catch (error) {
    console.error('Name change error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
} 