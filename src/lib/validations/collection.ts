import { z } from "zod";
import { slugifyCollectionName } from "@/lib/collections/slug";

export const collectionInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Name must be at most 64 characters"),
});

export type CollectionInput = z.infer<typeof collectionInputSchema>;

export function collectionSlugFromName(name: string): string {
  const slug = slugifyCollectionName(name);
  if (!slug) {
    throw new Error("Invalid collection name");
  }
  return slug;
}
