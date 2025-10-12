import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hydrationLogs } from '@/db/schema';
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
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(hydrationLogs)
        .where(and(
          eq(hydrationLogs.id, parseInt(id)),
          eq(hydrationLogs.userId, 'default_user')
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Record not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // Filter by specific date
    if (date) {
      const records = await db.select()
        .from(hydrationLogs)
        .where(and(
          eq(hydrationLogs.date, date),
          eq(hydrationLogs.userId, 'default_user')
        ))
        .orderBy(desc(hydrationLogs.createdAt));

      return NextResponse.json(records);
    }

    // List with pagination and search
    let query = db.select().from(hydrationLogs);

    if (search) {
      query = query.where(and(
        like(hydrationLogs.date, `%${search}%`),
        eq(hydrationLogs.userId, 'default_user')
      ));
    } else {
      query = query.where(eq(hydrationLogs.userId, 'default_user'));
    }

    const results = await query
      .orderBy(desc(hydrationLogs.date))
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
    const { date, glassesCount, goal, userId } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (glassesCount === undefined || glassesCount === null) {
      return NextResponse.json({ 
        error: "Glasses count is required",
        code: "MISSING_GLASSES_COUNT" 
      }, { status: 400 });
    }

    // Validate glassesCount is a number >= 0
    if (typeof glassesCount !== 'number' || glassesCount < 0) {
      return NextResponse.json({ 
        error: "Glasses count must be a number greater than or equal to 0",
        code: "INVALID_GLASSES_COUNT" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      date: date.trim(),
      glassesCount: glassesCount,
      goal: goal !== undefined ? goal : 8,
      userId: userId || 'default_user',
      createdAt: new Date().toISOString()
    };

    const newRecord = await db.insert(hydrationLogs)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(hydrationLogs)
      .where(and(
        eq(hydrationLogs.id, parseInt(id)),
        eq(hydrationLogs.userId, 'default_user')
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { glassesCount, goal } = body;

    // Prepare update data (only allowed fields)
    const updateData: any = {};

    if (glassesCount !== undefined) {
      if (typeof glassesCount !== 'number' || glassesCount < 0) {
        return NextResponse.json({ 
          error: "Glasses count must be a number greater than or equal to 0",
          code: "INVALID_GLASSES_COUNT" 
        }, { status: 400 });
      }
      updateData.glassesCount = glassesCount;
    }

    if (goal !== undefined) {
      if (typeof goal !== 'number' || goal < 0) {
        return NextResponse.json({ 
          error: "Goal must be a number greater than or equal to 0",
          code: "INVALID_GOAL" 
        }, { status: 400 });
      }
      updateData.goal = goal;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    const updated = await db.update(hydrationLogs)
      .set(updateData)
      .where(and(
        eq(hydrationLogs.id, parseInt(id)),
        eq(hydrationLogs.userId, 'default_user')
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(hydrationLogs)
      .where(and(
        eq(hydrationLogs.id, parseInt(id)),
        eq(hydrationLogs.userId, 'default_user')
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(hydrationLogs)
      .where(and(
        eq(hydrationLogs.id, parseInt(id)),
        eq(hydrationLogs.userId, 'default_user')
      ))
      .returning();

    return NextResponse.json({
      message: 'Hydration log deleted successfully',
      record: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}