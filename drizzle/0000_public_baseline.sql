CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`division` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`owner` text NOT NULL,
	`place` text NOT NULL,
	`notes` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL,
	`editor` text NOT NULL
, `sort_order` real DEFAULT 0 NOT NULL, `deleted_at` text, `test_batch` text, `creator_key` text DEFAULT '' NOT NULL, `creator_name` text DEFAULT '' NOT NULL, `creator_account` text DEFAULT '' NOT NULL);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`size` integer NOT NULL,
	`key` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `member_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`auth_version` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `regulations` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL,
	`editor` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`deleted_at` text,
	`updated` text NOT NULL
, `login_email` text, `password_hash` text DEFAULT '' NOT NULL, `auth_version` integer DEFAULT 1 NOT NULL, `is_admin` integer DEFAULT 0 NOT NULL);
--> statement-breakpoint
CREATE INDEX `files_event_idx` ON `files` (`event_id`);
--> statement-breakpoint
CREATE INDEX `member_sessions_member_idx` ON `member_sessions` (`member_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_login_email_unique` ON `staff` (`login_email`);
