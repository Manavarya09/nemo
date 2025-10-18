-- Supabase (Postgres) schema for HerSpace
-- Run in Supabase SQL editor

create table if not exists hydration_logs (
  id serial primary key,
  date text not null,
  glasses_count integer not null,
  goal integer not null default 8,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_hydration_user_date on hydration_logs(user_id, date);

create table if not exists mood_logs (
  id serial primary key,
  date text not null,
  mood_value integer not null,
  mood_label text not null,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_mood_user_date on mood_logs(user_id, date);

create table if not exists weight_logs (
  id serial primary key,
  date text not null,
  weight numeric not null,
  week_label text not null,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_weight_user_date on weight_logs(user_id, date);

create table if not exists sleep_logs (
  id serial primary key,
  date text not null,
  bedtime text not null,
  wake_time text not null,
  hours numeric not null,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_sleep_user_date on sleep_logs(user_id, date);

create table if not exists gratitude_entries (
  id serial primary key,
  date text not null,
  entry_text text not null,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_gratitude_user_date on gratitude_entries(user_id, date);

create table if not exists cycle_data (
  id serial primary key,
  last_period_start text not null,
  period_length integer not null,
  cycle_length integer not null,
  user_id text not null default 'default_user',
  updated_at timestamptz not null
);
create index if not exists idx_cycle_data_user on cycle_data(user_id);

create table if not exists cycle_logs (
  id serial primary key,
  date text not null,
  cramps boolean not null default false,
  headache boolean not null default false,
  flow_level text not null,
  cravings boolean not null default false,
  mood text not null,
  energy text not null,
  notes text,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_cycle_logs_user_date on cycle_logs(user_id, date);

create table if not exists medicine_logs (
  id serial primary key,
  date text not null,
  medicine_name text not null,
  medicine_time text not null,
  taken boolean not null default false,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_medicine_user_date on medicine_logs(user_id, date);

create table if not exists photos (
  id serial primary key,
  date text not null,
  photo_data text not null,
  compliment text not null,
  user_id text not null default 'default_user',
  created_at timestamptz not null
);
create index if not exists idx_photos_user_date on photos(user_id, date);
