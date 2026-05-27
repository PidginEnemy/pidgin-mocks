import { NextResponse } from "next/server";
import { createCollection, listCollections } from "@/lib/db/collections";
import { collectionInputSchema } from "@/lib/validations/collection";

export async function GET() {
  const items = await listCollections();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = collectionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const collection = await createCollection(parsed.data);
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Collection with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
