import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cycleLogs } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

const VALID_FLOW_LEVELS = ['none', 'light', 'medium', 'heavy'];
const VALID_MOODS = ['happy', 'neutral', 'sad', 'irritated', 'tired'];
const VALID_ENERGY_LEVELS = ['low', 'normal', 'high'];

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
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(cycleLogs)
        .where(and(
          eq(cycleLogs.id, parseInt(id)),
          eq(cycleLogs.userId, 'default_user')
        ))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Record not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Query by date
    if (date) {
      const records = await db.select()
        .from(cycleLogs)
        .where(and(
          eq(cycleLogs.date, date),
          eq(cycleLogs.userId, 'default_user')
        ))
        .orderBy(desc(cycleLogs.date));

      return NextResponse.json(records, { status: 200 });
    }

    // List with optional search and pagination
    let query = db.select().from(cycleLogs);

    if (search) {
      query = query.where(and(
        like(cycleLogs.date, `%${search}%`),
        eq(cycleLogs.userId, 'default_user')
      ));
    } else {
      query = query.where(eq(cycleLogs.userId, 'default_user'));
    }

    const results = await query
      .orderBy(desc(cycleLogs.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { date, cramps, headache, flowLevel, cravings, mood, energy, notes, userId } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ 
        error: "Date is required",
        code: "MISSING_DATE" 
      }, { status: 400 });
    }

    if (!flowLevel) {
      return NextResponse.json({ 
        error: "Flow level is required",
        code: "MISSING_FLOW_LEVEL" 
      }, { status: 400 });
    }

    if (!mood) {
      return NextResponse.json({ 
        error: "Mood is required",
        code: "MISSING_MOOD" 
      }, { status: 400 });
    }

    if (!energy) {
      return NextResponse.json({ 
        error: "Energy level is required",
        code: "MISSING_ENERGY" 
      }, { status: 400 });
    }

    // Validate enum values
    if (!VALID_FLOW_LEVELS.includes(flowLevel)) {
      return NextResponse.json({ 
        error: `Flow level must be one of: ${VALID_FLOW_LEVELS.join(', ')}`,
        code: "INVALID_FLOW_LEVEL" 
      }, { status: 400 });
    }

    if (!VALID_MOODS.includes(mood)) {
      return NextResponse.json({ 
        error: `Mood must be one of: ${VALID_MOODS.join(', ')}`,
        code: "INVALID_MOOD" 
      }, { status: 400 });
    }

    if (!VALID_ENERGY_LEVELS.includes(energy)) {
      return NextResponse.json({ 
        error: `Energy level must be one of: ${VALID_ENERGY_LEVELS.join(', ')}`,
        code: "INVALID_ENERGY" 
      }, { status: 400 });
    }

    // Validate boolean fields
    if (cramps !== undefined && cramps !== 0 && cramps !== 1 && cramps !== false && cramps !== true) {
      return NextResponse.json({ 
        error: "Cramps must be 0 or 1 (boolean)",
        code: "INVALID_CRAMPS" 
      }, { status: 400 });
    }

    if (headache !== undefined && headache !== 0 && headache !== 1 && headache !== false && headache !== true) {
      return NextResponse.json({ 
        error: "Headache must be 0 or 1 (boolean)",
        code: "INVALID_HEADACHE" 
      }, { status: 400 });
    }

    if (cravings !== undefined && cravings !== 0 && cravings !== 1 && cravings !== false && cravings !== true) {
      return NextResponse.json({ 
        error: "Cravings must be 0 or 1 (boolean)",
        code: "INVALID_CRAVINGS" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults
    const insertData = {
      date: date.trim(),
      cramps: cramps !== undefined ? (cramps ? 1 : 0) : 0,
      headache: headache !== undefined ? (headache ? 1 : 0) : 0,
      flowLevel: flowLevel.trim(),
      cravings: cravings !== undefined ? (cravings ? 1 : 0) : 0,
      mood: mood.trim(),
      energy: energy.trim(),
      notes: notes ? notes.trim() : null,
      userId: userId || 'default_user',
      createdAt: new Date().toISOString()
    };

    const newRecord = await db.insert(cycleLogs)
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
      .from(cycleLogs)
      .where(and(
        eq(cycleLogs.id, parseInt(id)),
        eq(cycleLogs.userId, 'default_user')
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { cramps, headache, flowLevel, cravings, mood, energy, notes } = body;

    // Validate enum values if provided
    if (flowLevel && !VALID_FLOW_LEVELS.includes(flowLevel)) {
      return NextResponse.json({ 
        error: `Flow level must be one of: ${VALID_FLOW_LEVELS.join(', ')}`,
        code: "INVALID_FLOW_LEVEL" 
      }, { status: 400 });
    }

    if (mood && !VALID_MOODS.includes(mood)) {
      return NextResponse.json({ 
        error: `Mood must be one of: ${VALID_MOODS.join(', ')}`,
        code: "INVALID_MOOD" 
      }, { status: 400 });
    }

    if (energy && !VALID_ENERGY_LEVELS.includes(energy)) {
      return NextResponse.json({ 
        error: `Energy level must be one of: ${VALID_ENERGY_LEVELS.join(', ')}`,
        code: "INVALID_ENERGY" 
      }, { status: 400 });
    }

    // Validate boolean fields
    if (cramps !== undefined && cramps !== 0 && cramps !== 1 && cramps !== false && cramps !== true) {
      return NextResponse.json({ 
        error: "Cramps must be 0 or 1 (boolean)",
        code: "INVALID_CRAMPS" 
      }, { status: 400 });
    }

    if (headache !== undefined && headache !== 0 && headache !== 1 && headache !== false && headache !== true) {
      return NextResponse.json({ 
        error: "Headache must be 0 or 1 (boolean)",
        code: "INVALID_HEADACHE" 
      }, { status: 400 });
    }

    if (cravings !== undefined && cravings !== 0 && cravings !== 1 && cravings !== false && cravings !== true) {
      return NextResponse.json({ 
        error: "Cravings must be 0 or 1 (boolean)",
        code: "INVALID_CRAVINGS" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};

    if (cramps !== undefined) updateData.cramps = cramps ? 1 : 0;
    if (headache !== undefined) updateData.headache = headache ? 1 : 0;
    if (flowLevel) updateData.flowLevel = flowLevel.trim();
    if (cravings !== undefined) updateData.cravings = cravings ? 1 : 0;
    if (mood) updateData.mood = mood.trim();
    if (energy) updateData.energy = energy.trim();
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    const updated = await db.update(cycleLogs)
      .set(updateData)
      .where(and(
        eq(cycleLogs.id, parseInt(id)),
        eq(cycleLogs.userId, 'default_user')
      ))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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
      .from(cycleLogs)
      .where(and(
        eq(cycleLogs.id, parseInt(id)),
        eq(cycleLogs.userId, 'default_user')
      ))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Record not found',
        code: "NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(cycleLogs)
      .where(and(
        eq(cycleLogs.id, parseInt(id)),
        eq(cycleLogs.userId, 'default_user')
      ))
      .returning();

    return NextResponse.json({ 
      message: 'Record deleted successfully',
      deletedRecord: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}