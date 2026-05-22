import { NextRequest } from "next/server";
import { handleMockRequest } from "@/lib/mock/handler";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function resolve(
  request: NextRequest,
  context: RouteContext,
) {
  const { path } = await context.params;
  return handleMockRequest(request, path);
}

export const GET = resolve;
export const POST = resolve;
export const PUT = resolve;
export const PATCH = resolve;
export const DELETE = resolve;
export const HEAD = resolve;
export const OPTIONS = resolve;
