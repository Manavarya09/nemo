CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`photo_data` text NOT NULL,
	`compliment` text NOT NULL,
	`user_id` text DEFAULT 'default_user' NOT NULL,
	`created_at` text NOT NULL
);
