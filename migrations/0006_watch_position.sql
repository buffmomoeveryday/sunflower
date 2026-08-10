ALTER TABLE `movies_watch_history` ADD `position_seconds` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `movies_watch_history` ADD `duration_seconds` integer;--> statement-breakpoint
ALTER TABLE `movies_watch_history` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `series_watch_history` ADD `position_seconds` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `series_watch_history` ADD `duration_seconds` integer;--> statement-breakpoint
ALTER TABLE `series_watch_history` ADD `updated_at` integer;
