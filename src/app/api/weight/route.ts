import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weightLogs } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(weightLogs)
        .where(and(eq(weightLogs.id, idNum), eq(weightLogs.userId, 'default_user')))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0]);
    }

    // List with optional search
    let query = db.select().from(weightLogs).where(eq(weightLogs.userId, 'default_user'));

    if (search) {
      const searchCondition = or(
        like(weightLogs.date, `%${search}%`),
        like(weightLogs.weekLabel, `%${search}%`)
      );
      
      query = db
        .select()
        .from(weightLogs)
        .where(and(eq(weightLogs.userId, 'default_user'), searchCondition));
    }

    const results = await query
      .orderBy(desc(weightLogs.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
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
    const { date, weight, weekLabel, userId } = body;

    // Validation
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (weight === undefined || weight === null) {
      return NextResponse.json(
        { error: 'Weight is required', code: 'MISSING_WEIGHT' },
        { status: 400 }
      );
    }

    if (typeof weight !== 'number' || weight <= 0) {
      return NextResponse.json(
        { error: 'Weight must be a positive number', code: 'INVALID_WEIGHT' },
        { status: 400 }
      );
    }

    if (!weekLabel) {
      return NextResponse.json(
        { error: 'Week label is required', code: 'MISSING_WEEK_LABEL' },
        { status: 400 }
      );
    }

    // Insert new record
    const newRecord = await db
      .insert(weightLogs)
      .values({
        date: date.trim(),
        weight: weight,
        weekLabel: weekLabel.trim(),
        userId: userId || 'default_user',
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

    const idNum = parseInt(id);
    const body = await request.json();
    const { weight, weekLabel } = body;

    // Check if record exists
    const existing = await db
      .select()
      .from(weightLogs)
      .where(and(eq(weightLogs.id, idNum), eq(weightLogs.userId, 'default_user')))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate weight if provided
    if (weight !== undefined && weight !== null) {
      if (typeof weight !== 'number' || weight <= 0) {
        return NextResponse.json(
          { error: 'Weight must be a positive number', code: 'INVALID_WEIGHT' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: any = {};
    
    if (weight !== undefined && weight !== null) {
      updates.weight = weight;
    }
    
    if (weekLabel !== undefined && weekLabel !== null) {
      updates.weekLabel = weekLabel.trim();
    }

    // Update record
    const updated = await db
      .update(weightLogs)
      .set(updates)
      .where(and(eq(weightLogs.id, idNum), eq(weightLogs.userId, 'default_user')))
      .returning();

    return NextResponse.json(updated[0]);
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

    const idNum = parseInt(id);

    // Check if record exists
    const existing = await db
      .select()
      .from(weightLogs)
      .where(and(eq(weightLogs.id, idNum), eq(weightLogs.userId, 'default_user')))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deleted = await db
      .delete(weightLogs)
      .where(and(eq(weightLogs.id, idNum), eq(weightLogs.userId, 'default_user')))
      .returning();

    return NextResponse.json({
      message: 'Weight log deleted successfully',
      deleted: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}