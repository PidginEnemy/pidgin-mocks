import { NextResponse } from "next/server";
import { createEndpoint, listEndpoints } from "@/lib/db/endpoints";
import { endpointInputSchema } from "@/lib/validations/endpoint";

export async function GET() {
  const endpoints = await listEndpoints();
  return NextResponse.json(endpoints);
}

export async function POST(request: Request) {
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

    const endpoint = await createEndpoint(parsed.data);
    return NextResponse.json(endpoint, { status: 201 });
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
