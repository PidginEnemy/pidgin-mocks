import { NextRequest, NextResponse } from "next/server";
import { getEndpointByPathAndMethod } from "@/lib/db/endpoints";

function buildPath(segments: string[] | undefined): string {
  if (!segments || segments.length === 0) return "/";
  return `/${segments.join("/")}`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function handleMockRequest(
  request: NextRequest,
  segments: string[] | undefined,
): Promise<NextResponse> {
  const path = buildPath(segments);
  const method = request.method;

  if (method === "OPTIONS") {
    const record = await getEndpointByPathAndMethod(path, "OPTIONS");
    if (!record) {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }
    return new NextResponse(null, {
      status: record.statusCode,
      headers: corsHeaders,
    });
  }

  const record = await getEndpointByPathAndMethod(path, method);
  if (!record) {
    return NextResponse.json(
      { error: "Mock endpoint not configured" },
      { status: 404, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(record.responseBody);
  } catch {
    body = record.responseBody;
  }

  if (method === "HEAD") {
    return new NextResponse(null, {
      status: record.statusCode,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  return NextResponse.json(body, {
    status: record.statusCode,
    headers: corsHeaders,
  });
}
