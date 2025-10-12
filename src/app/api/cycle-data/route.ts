import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cycleData } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const DEFAULT_USER_ID = 'default_user';

// Helper function to validate ISO date string
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}

// Helper function to validate positive integer
function isPositiveInteger(value: any): boolean {
  return Number.isInteger(value) && value > 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(cycleData)
        .where(eq(cycleData.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Get user's cycle configuration (first record for default_user)
    const userConfig = await db
      .select()
      .from(cycleData)
      .where(eq(cycleData.userId, DEFAULT_USER_ID))
      .limit(1);

    if (userConfig.length === 0) {
      return NextResponse.json(
        { error: 'No cycle data found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(userConfig[0], { status: 200 });
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
    const { lastPeriodStart, periodLength, cycleLength, userId = DEFAULT_USER_ID } = body;

    // Validate required fields
    if (!lastPeriodStart) {
      return NextResponse.json(
        { error: 'lastPeriodStart is required', code: 'MISSING_LAST_PERIOD_START' },
        { status: 400 }
      );
    }

    if (periodLength === undefined || periodLength === null) {
      return NextResponse.json(
        { error: 'periodLength is required', code: 'MISSING_PERIOD_LENGTH' },
        { status: 400 }
      );
    }

    if (cycleLength === undefined || cycleLength === null) {
      return NextResponse.json(
        { error: 'cycleLength is required', code: 'MISSING_CYCLE_LENGTH' },
        { status: 400 }
      );
    }

    // Validate lastPeriodStart is valid ISO date
    if (!isValidISODate(lastPeriodStart)) {
      return NextResponse.json(
        { error: 'lastPeriodStart must be a valid ISO date string', code: 'INVALID_LAST_PERIOD_START' },
        { status: 400 }
      );
    }

    // Validate periodLength is positive integer
    if (!isPositiveInteger(periodLength)) {
      return NextResponse.json(
        { error: 'periodLength must be a positive integer', code: 'INVALID_PERIOD_LENGTH' },
        { status: 400 }
      );
    }

    // Validate cycleLength is positive integer
    if (!isPositiveInteger(cycleLength)) {
      return NextResponse.json(
        { error: 'cycleLength must be a positive integer', code: 'INVALID_CYCLE_LENGTH' },
        { status: 400 }
      );
    }

    // Insert new cycle data
    const newRecord = await db
      .insert(cycleData)
      .values({
        lastPeriodStart,
        periodLength,
        cycleLength,
        userId,
        updatedAt: new Date().toISOString(),
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { lastPeriodStart, periodLength, cycleLength } = body;

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(cycleData)
      .where(eq(cycleData.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with validation
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate lastPeriodStart if provided
    if (lastPeriodStart !== undefined) {
      if (!isValidISODate(lastPeriodStart)) {
        return NextResponse.json(
          { error: 'lastPeriodStart must be a valid ISO date string', code: 'INVALID_LAST_PERIOD_START' },
          { status: 400 }
        );
      }
      updates.lastPeriodStart = lastPeriodStart;
    }

    // Validate periodLength if provided
    if (periodLength !== undefined) {
      if (!isPositiveInteger(periodLength)) {
        return NextResponse.json(
          { error: 'periodLength must be a positive integer', code: 'INVALID_PERIOD_LENGTH' },
          { status: 400 }
        );
      }
      updates.periodLength = periodLength;
    }

    // Validate cycleLength if provided
    if (cycleLength !== undefined) {
      if (!isPositiveInteger(cycleLength)) {
        return NextResponse.json(
          { error: 'cycleLength must be a positive integer', code: 'INVALID_CYCLE_LENGTH' },
          { status: 400 }
        );
      }
      updates.cycleLength = cycleLength;
    }

    // Update record
    const updated = await db
      .update(cycleData)
      .set(updates)
      .where(eq(cycleData.id, parseInt(id)))
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(cycleData)
      .where(eq(cycleData.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deleted = await db
      .delete(cycleData)
      .where(eq(cycleData.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Cycle data deleted successfully',
        deleted: deleted[0],
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