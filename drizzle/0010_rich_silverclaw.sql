ALTER TABLE `user` ADD `onboarding_completed` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `company_name` text;--> statement-breakpoint
ALTER TABLE `user` ADD `team_size` text;--> statement-breakpoint
ALTER TABLE `user` ADD `email_provider` text;--> statement-breakpoint
ALTER TABLE `user` ADD `target_response_time` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `business_hours_start` text;--> statement-breakpoint
ALTER TABLE `user` ADD `business_hours_end` text;--> statement-breakpoint
ALTER TABLE `user` ADD `timezone` text DEFAULT 'UTC';