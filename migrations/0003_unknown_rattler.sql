ALTER TABLE `animes_bookmark` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `animes_bookmark` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `animes_watch_history` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `animes_watch_history` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `movies_bookmark` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `movies_bookmark` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `movies_watch_history` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `movies_watch_history` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `series_bookmark` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `series_bookmark` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `series_watch_history` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `series_watch_history` ADD `created_at` integer NOT NULL;