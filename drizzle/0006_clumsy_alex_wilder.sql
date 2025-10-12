ALTER TABLE `user` ADD `role` text DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `organization_id` text;