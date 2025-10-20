PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`events` text NOT NULL,
	`is_active` integer DEFAULT true,
	`secret` text,
	`headers` text,
	`retry_count` integer DEFAULT 3,
	`last_triggered_at` integer,
	`last_status` text,
	`last_error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_webhooks`("id", "user_id", "url", "events", "is_active", "secret", "headers", "retry_count", "last_triggered_at", "last_status", "last_error", "created_at", "updated_at") SELECT "id", "user_id", "url", "events", "is_active", "secret", "headers", "retry_count", "last_triggered_at", "last_status", "last_error", "created_at", "updated_at" FROM `webhooks`;--> statement-breakpoint
DROP TABLE `webhooks`;--> statement-breakpoint
ALTER TABLE `__new_webhooks` RENAME TO `webhooks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;