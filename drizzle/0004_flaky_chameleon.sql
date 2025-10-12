ALTER TABLE `emails` ADD `provider_id` integer REFERENCES email_providers(id);--> statement-breakpoint
ALTER TABLE `emails` ADD `external_id` text;--> statement-breakpoint
ALTER TABLE `emails` ADD `thread_id` text;--> statement-breakpoint
ALTER TABLE `emails` ADD `raw_headers` text;