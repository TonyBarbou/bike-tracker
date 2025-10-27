import { NextRequest, NextResponse } from 'next/server';
import { locationQueries } from '@/lib/db';

// POST - Receive location data from OwnTracks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // OwnTracks sends data in a specific format
    // _type: "location" is the most common
    if (body._type !== 'location') {
      return NextResponse.json(
        { error: 'Invalid payload type' },
        { status: 400 }
      );
    }

    const {
      tst,      // timestamp (epoch)
      lat,      // latitude
      lon,      // longitude
      alt,      // altitude
      vel,      // velocity/speed
      batt,     // battery level
      acc,      // accuracy
      tid,      // tracker ID
    } = body;

    // Insert location into database
    locationQueries.insertLocation.run(
      tst || Math.floor(Date.now() / 1000),
      lat,
      lon,
      alt || null,
      vel || null,
      batt || null,
      acc || null,
      tid || 'default'
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing location:', error);
    return NextResponse.json(
      { error: 'Failed to process location data' },
      { status: 500 }
    );
  }
}

// GET - Retrieve current location
export async function GET() {
  try {
    const location = locationQueries.getCurrentLocation.get();
    
    if (!location) {
      return NextResponse.json(
        { error: 'No location data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
