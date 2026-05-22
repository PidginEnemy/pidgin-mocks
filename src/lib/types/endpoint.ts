export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type Endpoint = {
  id: string;
  path: string;
  method: HttpMethod;
  statusCode: number;
  responseBody: string;
  createdAt: string;
  updatedAt: string;
};
