CREATE TABLE `endpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`method` text NOT NULL,
	`status_code` integer NOT NULL,
	`response_body` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `path_method_unique` ON `endpoints` (`path`,`method`);