import { NextResponse } from 'next/server';
import { testConnection, query } from '@/lib/db';

export async function GET() {
  try {
    await testConnection();
    
    const result = await query('SELECT 1 as test');
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful',
      data: result 
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
