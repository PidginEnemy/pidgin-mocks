import { NextResponse } from "next/server";
import {
  CollectionSlugConflictError,
  ForbiddenCollectionDeleteError,
  deleteCollection,
  updateCollection,
} from "@/lib/db/collections";
import { collectionInputSchema } from "@/lib/validations/collection";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const parsed = collectionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const collection = await updateCollection(id, parsed.data);
    if (!collection) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (error) {
    if (error instanceof CollectionSlugConflictError) {
      return NextResponse.json(
        { error: "Collection with this name already exists" },
        { status: 409 },
      );
    }
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

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const deleted = await deleteCollection(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ForbiddenCollectionDeleteError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
