import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Hydration tracking table
export const hydrationLogs = sqliteTable('hydration_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  glassesCount: integer('glasses_count').notNull(),
  goal: integer('goal').notNull().default(8),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Mood tracking table
export const moodLogs = sqliteTable('mood_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  moodValue: integer('mood_value').notNull(),
  moodLabel: text('mood_label').notNull(),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Weight tracking table
export const weightLogs = sqliteTable('weight_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  weight: real('weight').notNull(),
  weekLabel: text('week_label').notNull(),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Sleep tracking table
export const sleepLogs = sqliteTable('sleep_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  bedtime: text('bedtime').notNull(),
  wakeTime: text('wake_time').notNull(),
  hours: real('hours').notNull(),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Gratitude journal table
export const gratitudeEntries = sqliteTable('gratitude_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  entryText: text('entry_text').notNull(),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Cycle data configuration table
export const cycleData = sqliteTable('cycle_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lastPeriodStart: text('last_period_start').notNull(),
  periodLength: integer('period_length').notNull(),
  cycleLength: integer('cycle_length').notNull(),
  userId: text('user_id').notNull().default('default_user'),
  updatedAt: text('updated_at').notNull(),
});

// Cycle daily logs table
export const cycleLogs = sqliteTable('cycle_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  cramps: integer('cramps', { mode: 'boolean' }).notNull().default(0),
  headache: integer('headache', { mode: 'boolean' }).notNull().default(0),
  flowLevel: text('flow_level').notNull(),
  cravings: integer('cravings', { mode: 'boolean' }).notNull().default(0),
  mood: text('mood').notNull(),
  energy: text('energy').notNull(),
  notes: text('notes'),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Medicine tracking table
export const medicineLogs = sqliteTable('medicine_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  medicineName: text('medicine_name').notNull(),
  medicineTime: text('medicine_time').notNull(),
  taken: integer('taken', { mode: 'boolean' }).notNull().default(0),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});

// Add new photos table
export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  photoData: text('photo_data').notNull(),
  compliment: text('compliment').notNull(),
  userId: text('user_id').notNull().default('default_user'),
  createdAt: text('created_at').notNull(),
});