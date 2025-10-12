import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gratitudeEntries } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(gratitudeEntries)
        .where(and(
          eq(gratitudeEntries.id, parseInt(id)),
          eq(gratitudeEntries.userId, 'default_user')
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Gratitude entry not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with search and pagination
    let query = db.select().from(gratitudeEntries);

    // Base filter for default user
    let whereCondition = eq(gratitudeEntries.userId, 'default_user');

    // Add search condition
    if (search) {
      const searchCondition = or(
        like(gratitudeEntries.entryText, `%${search}%`),
        like(gratitudeEntries.date, `%${search}%`)
      );
      whereCondition = and(whereCondition, searchCondition);
    }

    const results = await query
      .where(whereCondition)
      .orderBy(desc(gratitudeEntries.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, entryText, userId } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (!entryText) {
      return NextResponse.json({ 
        error: "Entry text is required",
        code: "MISSING_ENTRY_TEXT" 
      }, { status: 400 });
    }

    if (typeof entryText !== 'string' || entryText.trim() === '') {
      return NextResponse.json({ 
        error: "Entry text must not be empty",
        code: "EMPTY_ENTRY_TEXT" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedEntryText = entryText.trim();

    // Prepare insert data
    const insertData = {
      date,
      entryText: sanitizedEntryText,
      userId: userId || 'default_user',
      createdAt: new Date().toISOString()
    };

    const newEntry = await db.insert(gratitudeEntries)
      .values(insertData)
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(gratitudeEntries)
      .where(and(
        eq(gratitudeEntries.id, parseInt(id)),
        eq(gratitudeEntries.userId, 'default_user')
      ))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Gratitude entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { entryText } = body;

    // Validate entryText if provided
    if (entryText !== undefined) {
      if (typeof entryText !== 'string' || entryText.trim() === '') {
        return NextResponse.json({ 
          error: "Entry text must not be empty",
          code: "EMPTY_ENTRY_TEXT" 
        }, { status: 400 });
      }
    }

    // Prepare update data (only allow updating entryText)
    const updates: { entryText?: string } = {};
    
    if (entryText !== undefined) {
      updates.entryText = entryText.trim();
    }

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    // Perform update
    const updated = await db.update(gratitudeEntries)
      .set(updates)
      .where(and(
        eq(gratitudeEntries.id, parseInt(id)),
        eq(gratitudeEntries.userId, 'default_user')
      ))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(gratitudeEntries)
      .where(and(
        eq(gratitudeEntries.id, parseInt(id)),
        eq(gratitudeEntries.userId, 'default_user')
      ))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Gratitude entry not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Perform delete
    const deleted = await db.delete(gratitudeEntries)
      .where(and(
        eq(gratitudeEntries.id, parseInt(id)),
        eq(gratitudeEntries.userId, 'default_user')
      ))
      .returning();

    return NextResponse.json({
      message: 'Gratitude entry deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}