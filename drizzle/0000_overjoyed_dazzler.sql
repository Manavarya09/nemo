CREATE TABLE `cycle_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`last_period_start` text NOT NULL,
	`period_length` integer NOT NULL,
	`cycle_length` integer NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cycle_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`cramps` integer DEFAULT 0 NOT NULL,
	`headache` integer DEFAULT 0 NOT NULL,
	`flow_level` text NOT NULL,
	`cravings` integer DEFAULT 0 NOT NULL,
	`mood` text NOT NULL,
	`energy` text NOT NULL,
	`notes` text,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gratitude_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`entry_text` text NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hydration_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`glasses_count` integer NOT NULL,
	`goal` integer DEFAULT 8 NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `medicine_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`medicine_name` text NOT NULL,
	`medicine_time` text NOT NULL,
	`taken` integer DEFAULT 0 NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mood_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`mood_value` integer NOT NULL,
	`mood_label` text NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sleep_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`bedtime` text NOT NULL,
	`wake_time` text NOT NULL,
	`hours` real NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`weight` real NOT NULL,
	`week_label` text NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
