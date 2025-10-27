import { NextRequest, NextResponse } from 'next/server';
import { stageQueries } from '@/lib/db';

// GET - Get a specific stage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid stage ID' },
        { status: 400 }
      );
    }

    const stage = await stageQueries.getStageById(id);
    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error fetching stage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stage' },
      { status: 500 }
    );
  }
}

// PUT - Update a stage
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid stage ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await stageQueries.updateStage(id, body);

    return NextResponse.json({ 
      success: true, 
      stage: result[0]
    });
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a stage
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid stage ID' },
        { status: 400 }
      );
    }

    await stageQueries.deleteStage(id);

    return NextResponse.json({ 
      success: true,
      message: 'Stage deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { error: 'Failed to delete stage' },
      { status: 500 }
    );
  }
}
