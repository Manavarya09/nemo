import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { moodLogs } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_MOOD_LABELS = ['Rough', 'Meh', 'Good', 'Great', 'Amazing'];
const DEFAULT_USER_ID = 'default_user';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(moodLogs)
        .where(
          and(
            eq(moodLogs.id, parseInt(id)),
            eq(moodLogs.userId, DEFAULT_USER_ID)
          )
        )
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Filter by date
    if (date) {
      const records = await db
        .select()
        .from(moodLogs)
        .where(
          and(
            eq(moodLogs.date, date),
            eq(moodLogs.userId, DEFAULT_USER_ID)
          )
        )
        .orderBy(desc(moodLogs.createdAt));

      return NextResponse.json(records, { status: 200 });
    }

    // List with search and pagination
    let query = db
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, DEFAULT_USER_ID));

    if (search) {
      const searchCondition = or(
        like(moodLogs.date, `%${search}%`),
        like(moodLogs.moodLabel, `%${search}%`)
      );

      const results = await db
        .select()
        .from(moodLogs)
        .where(
          and(
            eq(moodLogs.userId, DEFAULT_USER_ID),
            searchCondition
          )
        )
        .orderBy(desc(moodLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(results, { status: 200 });
    }

    const results = await query
      .orderBy(desc(moodLogs.createdAt))
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
    const { date, moodValue, moodLabel, userId } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (moodValue === undefined || moodValue === null) {
      return NextResponse.json(
        { error: 'Mood value is required', code: 'MISSING_MOOD_VALUE' },
        { status: 400 }
      );
    }

    if (!moodLabel) {
      return NextResponse.json(
        { error: 'Mood label is required', code: 'MISSING_MOOD_LABEL' },
        { status: 400 }
      );
    }

    // Validate moodValue range
    const parsedMoodValue = parseInt(moodValue);
    if (isNaN(parsedMoodValue) || parsedMoodValue < 0 || parsedMoodValue > 4) {
      return NextResponse.json(
        { error: 'Mood value must be between 0 and 4', code: 'INVALID_MOOD_VALUE' },
        { status: 400 }
      );
    }

    // Validate moodLabel
    if (!VALID_MOOD_LABELS.includes(moodLabel)) {
      return NextResponse.json(
        {
          error: `Mood label must be one of: ${VALID_MOOD_LABELS.join(', ')}`,
          code: 'INVALID_MOOD_LABEL'
        },
        { status: 400 }
      );
    }

    // Create new mood log
    const newMoodLog = await db
      .insert(moodLogs)
      .values({
        date: date.trim(),
        moodValue: parsedMoodValue,
        moodLabel: moodLabel.trim(),
        userId: userId?.trim() || DEFAULT_USER_ID,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newMoodLog[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { moodValue, moodLabel } = body;

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(moodLogs)
      .where(
        and(
          eq(moodLogs.id, parseInt(id)),
          eq(moodLogs.userId, DEFAULT_USER_ID)
        )
      )
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update object
    const updates: { moodValue?: number; moodLabel?: string } = {};

    // Validate and add moodValue if provided
    if (moodValue !== undefined && moodValue !== null) {
      const parsedMoodValue = parseInt(moodValue);
      if (isNaN(parsedMoodValue) || parsedMoodValue < 0 || parsedMoodValue > 4) {
        return NextResponse.json(
          { error: 'Mood value must be between 0 and 4', code: 'INVALID_MOOD_VALUE' },
          { status: 400 }
        );
      }
      updates.moodValue = parsedMoodValue;
    }

    // Validate and add moodLabel if provided
    if (moodLabel) {
      if (!VALID_MOOD_LABELS.includes(moodLabel)) {
        return NextResponse.json(
          {
            error: `Mood label must be one of: ${VALID_MOOD_LABELS.join(', ')}`,
            code: 'INVALID_MOOD_LABEL'
          },
          { status: 400 }
        );
      }
      updates.moodLabel = moodLabel.trim();
    }

    // Check if there are any valid updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update the record
    const updated = await db
      .update(moodLogs)
      .set(updates)
      .where(
        and(
          eq(moodLogs.id, parseInt(id)),
          eq(moodLogs.userId, DEFAULT_USER_ID)
        )
      )
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(moodLogs)
      .where(
        and(
          eq(moodLogs.id, parseInt(id)),
          eq(moodLogs.userId, DEFAULT_USER_ID)
        )
      )
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(moodLogs)
      .where(
        and(
          eq(moodLogs.id, parseInt(id)),
          eq(moodLogs.userId, DEFAULT_USER_ID)
        )
      )
      .returning();

    return NextResponse.json(
      {
        message: 'Mood log deleted successfully',
        deleted: deleted[0]
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