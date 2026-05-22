import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const endpoints = sqliteTable(
  "endpoints",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    method: text("method").notNull(),
    statusCode: integer("status_code").notNull(),
    responseBody: text("response_body").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("path_method_unique").on(table.path, table.method)],
);
