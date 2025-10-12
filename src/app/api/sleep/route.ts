import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sleepLogs } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

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
        .from(sleepLogs)
        .where(
          and(
            eq(sleepLogs.id, parseInt(id)),
            eq(sleepLogs.userId, 'default_user')
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

    // Filter by specific date
    if (date) {
      const records = await db
        .select()
        .from(sleepLogs)
        .where(
          and(
            eq(sleepLogs.date, date),
            eq(sleepLogs.userId, 'default_user')
          )
        )
        .orderBy(desc(sleepLogs.date));

      return NextResponse.json(records, { status: 200 });
    }

    // List with search and pagination
    let query = db
      .select()
      .from(sleepLogs)
      .where(eq(sleepLogs.userId, 'default_user'));

    if (search) {
      query = db
        .select()
        .from(sleepLogs)
        .where(
          and(
            like(sleepLogs.date, `%${search}%`),
            eq(sleepLogs.userId, 'default_user')
          )
        );
    }

    const results = await query
      .orderBy(desc(sleepLogs.date))
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
    const { date, bedtime, wakeTime, hours, userId } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!bedtime) {
      return NextResponse.json(
        { error: 'Bedtime is required', code: 'MISSING_BEDTIME' },
        { status: 400 }
      );
    }

    if (!wakeTime) {
      return NextResponse.json(
        { error: 'Wake time is required', code: 'MISSING_WAKE_TIME' },
        { status: 400 }
      );
    }

    if (hours === undefined || hours === null) {
      return NextResponse.json(
        { error: 'Hours is required', code: 'MISSING_HOURS' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(bedtime)) {
      return NextResponse.json(
        { error: 'Bedtime must be in HH:MM format', code: 'INVALID_BEDTIME_FORMAT' },
        { status: 400 }
      );
    }

    if (!timePattern.test(wakeTime)) {
      return NextResponse.json(
        { error: 'Wake time must be in HH:MM format', code: 'INVALID_WAKE_TIME_FORMAT' },
        { status: 400 }
      );
    }

    // Validate hours is positive
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      return NextResponse.json(
        { error: 'Hours must be a positive number', code: 'INVALID_HOURS' },
        { status: 400 }
      );
    }

    const newRecord = await db
      .insert(sleepLogs)
      .values({
        date: date.trim(),
        bedtime: bedtime.trim(),
        wakeTime: wakeTime.trim(),
        hours: hoursNum,
        userId: userId?.trim() || 'default_user',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
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

    // Check if record exists
    const existing = await db
      .select()
      .from(sleepLogs)
      .where(
        and(
          eq(sleepLogs.id, parseInt(id)),
          eq(sleepLogs.userId, 'default_user')
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { bedtime, wakeTime, hours } = body;

    // Validate time format if provided
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
    if (bedtime !== undefined && !timePattern.test(bedtime)) {
      return NextResponse.json(
        { error: 'Bedtime must be in HH:MM format', code: 'INVALID_BEDTIME_FORMAT' },
        { status: 400 }
      );
    }

    if (wakeTime !== undefined && !timePattern.test(wakeTime)) {
      return NextResponse.json(
        { error: 'Wake time must be in HH:MM format', code: 'INVALID_WAKE_TIME_FORMAT' },
        { status: 400 }
      );
    }

    // Validate hours if provided
    if (hours !== undefined) {
      const hoursNum = parseFloat(hours);
      if (isNaN(hoursNum) || hoursNum <= 0) {
        return NextResponse.json(
          { error: 'Hours must be a positive number', code: 'INVALID_HOURS' },
          { status: 400 }
        );
      }
    }

    // Build update object with only allowed fields
    const updates: any = {};
    if (bedtime !== undefined) updates.bedtime = bedtime.trim();
    if (wakeTime !== undefined) updates.wakeTime = wakeTime.trim();
    if (hours !== undefined) updates.hours = parseFloat(hours);

    const updated = await db
      .update(sleepLogs)
      .set(updates)
      .where(
        and(
          eq(sleepLogs.id, parseInt(id)),
          eq(sleepLogs.userId, 'default_user')
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

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
    const existing = await db
      .select()
      .from(sleepLogs)
      .where(
        and(
          eq(sleepLogs.id, parseInt(id)),
          eq(sleepLogs.userId, 'default_user')
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(sleepLogs)
      .where(
        and(
          eq(sleepLogs.id, parseInt(id)),
          eq(sleepLogs.userId, 'default_user')
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Sleep log deleted successfully',
        record: deleted[0],
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