CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_slug_unique` ON `collections` (`slug`);
--> statement-breakpoint
INSERT INTO `collections` (`id`, `name`, `slug`, `created_at`, `updated_at`)
VALUES (
	'a0000000-0000-4000-8000-000000000001',
	'Common',
	'common',
	datetime('now'),
	datetime('now')
);
--> statement-breakpoint
ALTER TABLE `endpoints` ADD `collection_id` text;
--> statement-breakpoint
UPDATE `endpoints` SET `collection_id` = 'a0000000-0000-4000-8000-000000000001';
--> statement-breakpoint
DROP INDEX `path_method_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `collection_path_method_unique` ON `endpoints` (`collection_id`, `path`, `method`);
