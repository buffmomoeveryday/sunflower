CREATE TABLE `animes_bookmark` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdb_id` text NOT NULL,
	`poster` text NOT NULL,
	`name` text NOT NULL,
	`vote` text NOT NULL,
	`start_date` text NOT NULL,
	`title` text NOT NULL,
	`episodes` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `animes_watch_history` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdb_id` text NOT NULL,
	`poster` text NOT NULL,
	`name` text NOT NULL,
	`vote` text NOT NULL,
	`start_date` text NOT NULL,
	`title` text NOT NULL,
	`episodes` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movies_watch_history` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdb_id` text NOT NULL,
	`poster_path` text NOT NULL,
	`title` text NOT NULL,
	`vote_average` text NOT NULL,
	`release_date` text NOT NULL,
	`genre_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `series_watch_history` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdb_id` text NOT NULL,
	`poster_path` text NOT NULL,
	`name` text NOT NULL,
	`vote_average` text NOT NULL,
	`first_air_date` text NOT NULL,
	`number_of_seasons` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `series_bookmark` ADD `tmdb_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `series_bookmark` DROP COLUMN `tmdn_id`;