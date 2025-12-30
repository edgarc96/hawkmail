ALTER TABLE `emails` ADD `category` text;--> statement-breakpoint
ALTER TABLE `emails` ADD `sentiment` text;--> statement-breakpoint
ALTER TABLE `emails` ADD `confidence` real;--> statement-breakpoint
ALTER TABLE `emails` ADD `suggested_tags` text;--> statement-breakpoint
ALTER TABLE `emails` ADD `is_auto_assigned` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `emails` ADD `auto_assign_reason` text;