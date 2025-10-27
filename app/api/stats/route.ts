import { NextResponse } from 'next/server';
import { getTripStatistics } from '@/lib/db';

// GET - Retrieve trip statistics
export async function GET() {
  try {
    const stats = await getTripStatistics();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
