import { NextResponse } from 'next/server';
import { locationQueries } from '@/lib/db';

// GET - Retrieve location history
export async function GET() {
  try {
    const locations = locationQueries.getLocationHistory.all();
    
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching location history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location history' },
      { status: 500 }
    );
  }
}
