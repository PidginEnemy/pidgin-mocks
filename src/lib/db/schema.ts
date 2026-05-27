import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const collections = sqliteTable(
  "collections",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("collections_slug_unique").on(table.slug)],
);

export const endpoints = sqliteTable(
  "endpoints",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id),
    path: text("path").notNull(),
    method: text("method").notNull(),
    statusCode: integer("status_code").notNull(),
    responseBody: text("response_body").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("collection_path_method_unique").on(
      table.collectionId,
      table.path,
      table.method,
    ),
  ],
);
