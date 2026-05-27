import { NextRequest } from "next/server";
import { handleMockRequest } from "@/lib/mock/handler";

type RouteContext = {
  params: Promise<{ collection: string; path?: string[] }>;
};

async function resolve(request: NextRequest, context: RouteContext) {
  const { collection, path } = await context.params;
  return handleMockRequest(request, collection, path);
}

export const GET = resolve;
export const POST = resolve;
export const PUT = resolve;
export const PATCH = resolve;
export const DELETE = resolve;
export const HEAD = resolve;
export const OPTIONS = resolve;
