import { NextResponse } from "next/server";
import {
  deleteEndpoint,
  getEndpointById,
  updateEndpoint,
} from "@/lib/db/endpoints";
import { endpointInputSchema } from "@/lib/validations/endpoint";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const endpoint = await getEndpointById(id);
  if (!endpoint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(endpoint);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const parsed = endpointInputSchema.safeParse({
      ...body,
      statusCode: Number(body.statusCode),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const endpoint = await updateEndpoint(id, parsed.data);
    if (!endpoint) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(endpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Endpoint with this path and method already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteEndpoint(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
