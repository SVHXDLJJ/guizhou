CREATE TABLE `favorites` (
	`item_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`area` text NOT NULL,
	`category` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`image_key` text,
	`created_at` integer NOT NULL
);
