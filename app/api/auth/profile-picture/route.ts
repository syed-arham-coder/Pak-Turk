import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return new NextResponse('Missing userId', { status: 400 });
  }
  const conn = await getConnection();
  try {
    const [users]: any = await conn.query('SELECT profile_picture FROM users WHERE id = ?', [userId]);
    conn.release();
    if (!users || users.length === 0 || !users[0].profile_picture) {
      return new NextResponse('Not found', { status: 404 });
    }
    const buffer = users[0].profile_picture;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    conn.release();
    return new NextResponse('Server error', { status: 500 });
  }
}