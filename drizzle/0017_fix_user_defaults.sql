-- Fix user table defaults for Better Auth compatibility
-- Recreate user table with proper default values
CREATE TABLE `user_new` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer NOT NULL DEFAULT 0,
	`image` text,
	`role` text NOT NULL DEFAULT 'admin',
	`organization_id` text,
	`stripe_customer_id` text,
	`onboarding_completed` integer NOT NULL DEFAULT 0,
	`company_name` text,
	`team_size` text,
	`email_provider` text,
	`target_response_time` integer,
	`business_hours_start` text,
	`business_hours_end` text,
	`timezone` text DEFAULT 'UTC',
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `user_new` SELECT * FROM `user`;
--> statement-breakpoint
DROP TABLE `user`;
--> statement-breakpoint
ALTER TABLE `user_new` RENAME TO `user`;
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
--> statement-breakpoint
-- Fix account table defaults
CREATE TABLE `account_new` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `account_new` SELECT * FROM `account`;
--> statement-breakpoint
DROP TABLE `account`;
--> statement-breakpoint
ALTER TABLE `account_new` RENAME TO `account`;
--> statement-breakpoint
-- Fix session table defaults
CREATE TABLE `session_new` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL DEFAULT (unixepoch()),
	`updated_at` integer NOT NULL DEFAULT (unixepoch()),
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `session_new` SELECT * FROM `session`;
--> statement-breakpoint
DROP TABLE `session`;
--> statement-breakpoint
ALTER TABLE `session_new` RENAME TO `session`;
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
