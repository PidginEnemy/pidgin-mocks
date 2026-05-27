import { and, asc, eq } from "drizzle-orm";
import {
  pathMatchesPattern,
  patternSpecificity,
} from "@/lib/path-pattern";
import { db } from "./index";
import { collections, endpoints } from "./schema";
import type { Endpoint, HttpMethod } from "@/lib/types/endpoint";
import type { EndpointInput } from "@/lib/validations/endpoint";

type EndpointRow = {
  endpoint: typeof endpoints.$inferSelect;
  collection: typeof collections.$inferSelect;
};

function rowToEndpoint(row: EndpointRow): Endpoint {
  return {
    id: row.endpoint.id,
    collectionId: row.endpoint.collectionId,
    collectionSlug: row.collection.slug,
    collectionName: row.collection.name,
    path: row.endpoint.path,
    method: row.endpoint.method as HttpMethod,
    statusCode: row.endpoint.statusCode,
    responseBody: row.endpoint.responseBody,
    createdAt: row.endpoint.createdAt,
    updatedAt: row.endpoint.updatedAt,
  };
}

function endpointSelect() {
  return db
    .select({
      endpoint: endpoints,
      collection: collections,
    })
    .from(endpoints)
    .innerJoin(collections, eq(endpoints.collectionId, collections.id));
}

export async function listEndpoints(): Promise<Endpoint[]> {
  const rows = await endpointSelect().orderBy(
    asc(collections.name),
    asc(endpoints.path),
    asc(endpoints.method),
  );
  return rows.map(rowToEndpoint);
}

export async function getEndpointById(id: string): Promise<Endpoint | null> {
  const rows = await endpointSelect().where(eq(endpoints.id, id));
  return rows[0] ? rowToEndpoint(rows[0]) : null;
}

export async function getEndpointByCollectionPathAndMethod(
  collectionSlug: string,
  path: string,
  method: string,
): Promise<Endpoint | null> {
  const rows = await endpointSelect().where(
    and(eq(collections.slug, collectionSlug), eq(endpoints.method, method)),
  );

  const matches = rows
    .map(rowToEndpoint)
    .filter((endpoint) => pathMatchesPattern(path, endpoint.path))
    .sort(
      (a, b) => patternSpecificity(b.path) - patternSpecificity(a.path),
    );

  return matches[0] ?? null;
}

export async function createEndpoint(input: EndpointInput): Promise<Endpoint> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const normalizedBody = JSON.stringify(JSON.parse(input.responseBody));

  await db.insert(endpoints).values({
    id,
    collectionId: input.collectionId,
    path: input.path,
    method: input.method,
    statusCode: input.statusCode,
    responseBody: normalizedBody,
    createdAt: now,
    updatedAt: now,
  });

  const created = await getEndpointById(id);
  if (!created) {
    throw new Error("Failed to create endpoint");
  }
  return created;
}

export async function updateEndpoint(
  id: string,
  input: EndpointInput,
): Promise<Endpoint | null> {
  const existing = await getEndpointById(id);
  if (!existing) return null;

  const normalizedBody = JSON.stringify(JSON.parse(input.responseBody));

  await db
    .update(endpoints)
    .set({
      collectionId: input.collectionId,
      path: input.path,
      method: input.method,
      statusCode: input.statusCode,
      responseBody: normalizedBody,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(endpoints.id, id));

  return getEndpointById(id);
}

export async function deleteEndpoint(id: string): Promise<boolean> {
  const result = await db.delete(endpoints).where(eq(endpoints.id, id));
  return result.changes > 0;
}
