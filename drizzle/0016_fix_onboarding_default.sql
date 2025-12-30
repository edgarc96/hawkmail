ALTER TABLE `user` ADD COLUMN `onboarding_completed_new` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `user` SET `onboarding_completed_new` = COALESCE(`onboarding_completed`, 0);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `onboarding_completed`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `onboarding_completed_new` TO `onboarding_completed`;
