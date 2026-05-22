import { asc, eq } from "drizzle-orm";
import {
  pathMatchesPattern,
  patternSpecificity,
} from "@/lib/path-pattern";
import { db } from "./index";
import { endpoints } from "./schema";
import type { Endpoint, HttpMethod } from "@/lib/types/endpoint";
import type { EndpointInput } from "@/lib/validations/endpoint";

function rowToEndpoint(row: typeof endpoints.$inferSelect): Endpoint {
  return {
    id: row.id,
    path: row.path,
    method: row.method as HttpMethod,
    statusCode: row.statusCode,
    responseBody: row.responseBody,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listEndpoints(): Promise<Endpoint[]> {
  const rows = await db
    .select()
    .from(endpoints)
    .orderBy(asc(endpoints.path), asc(endpoints.method));
  return rows.map(rowToEndpoint);
}

export async function getEndpointById(id: string): Promise<Endpoint | null> {
  const rows = await db.select().from(endpoints).where(eq(endpoints.id, id));
  return rows[0] ? rowToEndpoint(rows[0]) : null;
}

export async function getEndpointByPathAndMethod(
  path: string,
  method: string,
): Promise<Endpoint | null> {
  const rows = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.method, method));

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
