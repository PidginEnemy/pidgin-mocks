export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
