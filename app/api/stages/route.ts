import { NextRequest, NextResponse } from 'next/server';
import { stageQueries } from '@/lib/db';

// GET - Retrieve all stages
export async function GET() {
  try {
    const stages = await stageQueries.getAllStages();
    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

// POST - Create a new stage
export async function POST(request: NextRequest) {
  try {
    // Simple password authentication
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';
    
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      date,
      day_number,
      name,
      planned_distance_km,
      planned_elevation_gain_m,
      gpx_data,
      route_coordinates,
      waypoints,
      start_location,
      end_location,
      notes,
      status,
    } = body;

    if (!date || !name || planned_distance_km === undefined || planned_elevation_gain_m === undefined) {
      return NextResponse.json(
        { error: 'Date, name, planned distance, and planned elevation are required' },
        { status: 400 }
      );
    }

    const result = await stageQueries.insertStage(
      date,
      day_number || null,
      name,
      planned_distance_km,
      planned_elevation_gain_m,
      gpx_data || null,
      route_coordinates || null,
      waypoints || null,
      start_location || null,
      end_location || null,
      notes || null,
      status || 'pending'
    );

    return NextResponse.json({ 
      success: true, 
      stage: result[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating stage:', error);
    
    // Check for unique constraint violation (duplicate date)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A stage already exists for this date' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create stage' },
      { status: 500 }
    );
  }
}
