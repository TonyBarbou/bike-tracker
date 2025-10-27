import { NextRequest, NextResponse } from 'next/server';
import { postQueries } from '@/lib/db';

// GET - Retrieve all posts
export async function GET() {
  try {
    const posts = postQueries.getAllPosts.all();
    
    // Parse images JSON string back to array
    const postsWithImages = posts.map((post: any) => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));
    
    return NextResponse.json(postsWithImages);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new post
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
    const { title, content, latitude, longitude, location_name, images } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Convert images array to JSON string for storage
    const imagesJson = images ? JSON.stringify(images) : null;

    const result = postQueries.insertPost.run(
      title,
      content,
      latitude || null,
      longitude || null,
      location_name || null,
      imagesJson
    );

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
