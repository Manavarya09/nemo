import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photos } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const DEFAULT_USER_ID = 'default_user';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single photo by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const photo = await db
        .select()
        .from(photos)
        .where(and(eq(photos.id, parseInt(id)), eq(photos.userId, DEFAULT_USER_ID)))
        .limit(1);

      if (photo.length === 0) {
        return NextResponse.json(
          { error: 'Photo not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(photo[0], { status: 200 });
    }

    // List all photos with pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const results = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, DEFAULT_USER_ID))
      .orderBy(desc(photos.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, photoData, compliment } = body;

    // Validate required fields
    if (!date || typeof date !== 'string' || date.trim() === '') {
      return NextResponse.json(
        { error: 'Date is required and must be a non-empty string', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!photoData || typeof photoData !== 'string' || photoData.trim() === '') {
      return NextResponse.json(
        { error: 'Photo data is required and must be a non-empty base64 string', code: 'MISSING_PHOTO_DATA' },
        { status: 400 }
      );
    }

    if (!compliment || typeof compliment !== 'string' || compliment.trim() === '') {
      return NextResponse.json(
        { error: 'Compliment is required and must be a non-empty string', code: 'MISSING_COMPLIMENT' },
        { status: 400 }
      );
    }

    // Create new photo
    const newPhoto = await db
      .insert(photos)
      .values({
        date: date.trim(),
        photoData: photoData.trim(),
        compliment: compliment.trim(),
        userId: DEFAULT_USER_ID,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newPhoto[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if photo exists and belongs to default user
    const existingPhoto = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, parseInt(id)), eq(photos.userId, DEFAULT_USER_ID)))
      .limit(1);

    if (existingPhoto.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the photo
    const deleted = await db
      .delete(photos)
      .where(and(eq(photos.id, parseInt(id)), eq(photos.userId, DEFAULT_USER_ID)))
      .returning();

    return NextResponse.json(
      {
        message: 'Photo deleted successfully',
        photo: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}