PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`role` text DEFAULT 'admin' NOT NULL,
	`organization_id` text,
	`stripe_customer_id` text,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`company_name` text,
	`team_size` text,
	`email_provider` text,
	`target_response_time` integer,
	`business_hours_start` text,
	`business_hours_end` text,
	`timezone` text DEFAULT 'UTC',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "email_verified", "image", "role", "organization_id", "stripe_customer_id", "onboarding_completed", "company_name", "team_size", "email_provider", "target_response_time", "business_hours_start", "business_hours_end", "timezone", "created_at", "updated_at") SELECT "id", "name", "email", "email_verified", "image", "role", "organization_id", "stripe_customer_id", "onboarding_completed", "company_name", "team_size", "email_provider", "target_response_time", "business_hours_start", "business_hours_end", "timezone", "created_at", "updated_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);