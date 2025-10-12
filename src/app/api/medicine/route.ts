import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medicineLogs } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

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
        .from(medicineLogs)
        .where(
          and(
            eq(medicineLogs.id, parseInt(id)),
            eq(medicineLogs.userId, 'default_user')
          )
        )
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0]);
    }

    // Build query with filters
    let query = db.select().from(medicineLogs);
    const conditions = [eq(medicineLogs.userId, 'default_user')];

    // Filter by date
    if (date) {
      conditions.push(eq(medicineLogs.date, date));
    }

    // Search functionality
    if (search) {
      const searchCondition = or(
        like(medicineLogs.date, `%${search}%`),
        like(medicineLogs.medicineName, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    query = query.where(and(...conditions));

    // Order by date DESC, then medicineTime
    const results = await query
      .orderBy(desc(medicineLogs.date), asc(medicineLogs.medicineTime))
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
    const { date, medicineName, medicineTime, taken, userId } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    if (!medicineName) {
      return NextResponse.json(
        { error: 'Medicine name is required', code: 'MISSING_MEDICINE_NAME' },
        { status: 400 }
      );
    }

    if (!medicineTime) {
      return NextResponse.json(
        { error: 'Medicine time is required', code: 'MISSING_MEDICINE_TIME' },
        { status: 400 }
      );
    }

    // Validate medicineTime
    if (medicineTime !== 'Morning' && medicineTime !== 'Evening') {
      return NextResponse.json(
        {
          error: 'Medicine time must be either "Morning" or "Evening"',
          code: 'INVALID_MEDICINE_TIME',
        },
        { status: 400 }
      );
    }

    // Validate taken if provided
    if (taken !== undefined && taken !== 0 && taken !== 1) {
      return NextResponse.json(
        { error: 'Taken must be 0 or 1', code: 'INVALID_TAKEN_VALUE' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      date: date.trim(),
      medicineName: medicineName.trim(),
      medicineTime: medicineTime.trim(),
      taken: taken !== undefined ? taken : 0,
      userId: userId?.trim() || 'default_user',
      createdAt: new Date().toISOString(),
    };

    const newRecord = await db.insert(medicineLogs).values(insertData).returning();

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

    const body = await request.json();
    const { medicineName, medicineTime, taken } = body;

    // Check if record exists
    const existing = await db
      .select()
      .from(medicineLogs)
      .where(
        and(
          eq(medicineLogs.id, parseInt(id)),
          eq(medicineLogs.userId, 'default_user')
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Validate medicineTime if provided
    if (
      medicineTime !== undefined &&
      medicineTime !== 'Morning' &&
      medicineTime !== 'Evening'
    ) {
      return NextResponse.json(
        {
          error: 'Medicine time must be either "Morning" or "Evening"',
          code: 'INVALID_MEDICINE_TIME',
        },
        { status: 400 }
      );
    }

    // Validate taken if provided
    if (taken !== undefined && taken !== 0 && taken !== 1) {
      return NextResponse.json(
        { error: 'Taken must be 0 or 1', code: 'INVALID_TAKEN_VALUE' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updates: any = {};
    if (medicineName !== undefined) updates.medicineName = medicineName.trim();
    if (medicineTime !== undefined) updates.medicineTime = medicineTime.trim();
    if (taken !== undefined) updates.taken = taken;

    // Return existing record if no updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existing[0]);
    }

    const updated = await db
      .update(medicineLogs)
      .set(updates)
      .where(
        and(
          eq(medicineLogs.id, parseInt(id)),
          eq(medicineLogs.userId, 'default_user')
        )
      )
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

    // Check if record exists
    const existing = await db
      .select()
      .from(medicineLogs)
      .where(
        and(
          eq(medicineLogs.id, parseInt(id)),
          eq(medicineLogs.userId, 'default_user')
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const deleted = await db
      .delete(medicineLogs)
      .where(
        and(
          eq(medicineLogs.id, parseInt(id)),
          eq(medicineLogs.userId, 'default_user')
        )
      )
      .returning();

    return NextResponse.json({
      message: 'Record deleted successfully',
      record: deleted[0],
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}