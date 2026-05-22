import { ApiError } from "@/lib/api/errors";

type ErrorBody = { error?: string };

export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as ErrorBody).error === "string"
        ? (data as ErrorBody).error!
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
