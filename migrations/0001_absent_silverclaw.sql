CREATE TABLE `series_bookmark` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdn_id` text NOT NULL,
	`poster_path` text NOT NULL,
	`name` text NOT NULL,
	`vote_average` text NOT NULL,
	`first_air_date` text NOT NULL,
	`number_of_seasons` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movies_bookmark` (
	`id` text PRIMARY KEY NOT NULL,
	`tmdb_id` text NOT NULL,
	`poster_path` text NOT NULL,
	`title` text NOT NULL,
	`vote_average` text NOT NULL,
	`release_date` text NOT NULL,
	`genre_ids` text NOT NULL
);
