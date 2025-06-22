import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const userId = formData.get('userId');
  const file = formData.get('profilePicture') as File;

  if (!userId || !file) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const conn = await getConnection();
  try {
    await conn.query('UPDATE users SET profile_picture = ? WHERE id = ?', [buffer, userId]);
    conn.release();
    return NextResponse.json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    conn.release();
    return NextResponse.json({ message: 'Failed to update profile picture' }, { status: 500 });
  }
}

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