import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbName: process.env.DB_NAME,
  });
}
