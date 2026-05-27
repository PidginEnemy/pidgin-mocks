import { and, asc, eq, ne } from "drizzle-orm";
import { COMMON_COLLECTION_ID } from "@/lib/collections/constants";
import { slugifyCollectionName } from "@/lib/collections/slug";
import { db } from "./index";
import { collections, endpoints } from "./schema";
import type { Collection } from "@/lib/types/collection";
import type { CollectionInput } from "@/lib/validations/collection";

function rowToCollection(row: typeof collections.$inferSelect): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCollections(): Promise<Collection[]> {
  const rows = await db
    .select()
    .from(collections)
    .orderBy(asc(collections.name));
  return rows.map(rowToCollection);
}

export async function getCollectionById(
  id: string,
): Promise<Collection | null> {
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id));
  return rows[0] ? rowToCollection(rows[0]) : null;
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug));
  return rows[0] ? rowToCollection(rows[0]) : null;
}

export async function createCollection(
  input: CollectionInput,
): Promise<Collection> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const slug = slugifyCollectionName(input.name);

  if (!slug) {
    throw new Error("Invalid collection name");
  }

  await db.insert(collections).values({
    id,
    name: input.name.trim(),
    slug,
    createdAt: now,
    updatedAt: now,
  });

  const created = await getCollectionById(id);
  if (!created) {
    throw new Error("Failed to create collection");
  }
  return created;
}

/** Slug already used by another collection (not HTTP-specific). */
export class CollectionSlugConflictError extends Error {
  constructor() {
    super("COLLECTION_SLUG_CONFLICT");
    this.name = "CollectionSlugConflictError";
  }
}

export class ForbiddenCollectionDeleteError extends Error {
  constructor() {
    super("Cannot delete default Common collection");
    this.name = "ForbiddenCollectionDeleteError";
  }
}

export async function updateCollection(
  id: string,
  input: CollectionInput,
): Promise<Collection | null> {
  const existing = await getCollectionById(id);
  if (!existing) return null;

  const slug = slugifyCollectionName(input.name.trim());
  if (!slug) {
    throw new Error("Invalid collection name");
  }

  const conflictRows = await db
    .select({ id: collections.id })
    .from(collections)
    .where(and(eq(collections.slug, slug), ne(collections.id, id)));

  if (conflictRows.length > 0) {
    throw new CollectionSlugConflictError();
  }

  const now = new Date().toISOString();

  await db
    .update(collections)
    .set({
      name: input.name.trim(),
      slug,
      updatedAt: now,
    })
    .where(eq(collections.id, id));

  return getCollectionById(id);
}

export async function deleteCollection(id: string): Promise<boolean> {
  if (id === COMMON_COLLECTION_ID) {
    throw new ForbiddenCollectionDeleteError();
  }

  const existing = await getCollectionById(id);
  if (!existing) return false;

  await db.delete(endpoints).where(eq(endpoints.collectionId, id));
  const collectionResult = await db
    .delete(collections)
    .where(eq(collections.id, id));

  return collectionResult.changes > 0;
}
