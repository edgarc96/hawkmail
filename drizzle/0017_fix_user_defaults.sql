-- Fix user table defaults for Better Auth compatibility
-- Recreate user table with proper default values
CREATE TABLE `user_new` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
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
