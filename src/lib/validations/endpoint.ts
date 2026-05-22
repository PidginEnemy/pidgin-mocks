import { z } from "zod";
import { HTTP_METHODS } from "@/lib/types/endpoint";

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export const endpointInputSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Path is required")
    .refine((p) => p.startsWith("/"), "Path must start with /")
    .refine((p) => !/\s/.test(p), "Path must not contain spaces"),
  method: z.enum(HTTP_METHODS),
  statusCode: z
    .number()
    .int()
    .min(100, "Status code must be at least 100")
    .max(599, "Status code must be at most 599"),
  responseBody: z
    .string()
    .min(1, "Response body is required")
    .refine(isValidJson, "Response body must be valid JSON"),
});

export type EndpointInput = z.infer<typeof endpointInputSchema>;
