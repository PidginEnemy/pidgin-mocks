"use client";

import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { Endpoint, HttpMethod } from "@/lib/types/endpoint";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

export type EndpointPayload = {
  collectionId: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  responseBody: string;
};

export function useEndpointsQuery() {
  return useApiQuery<Endpoint[]>({
    queryKey: queryKeys.endpoints.list(),
    url: "/admin/api/endpoints",
  });
}

export function useCreateEndpointMutation() {
  return useApiMutation<Endpoint, EndpointPayload>({
    mutationFn: (payload) =>
      apiFetch<Endpoint>("/admin/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    invalidateKeys: [queryKeys.endpoints.list(), queryKeys.collections.list()],
  });
}

export function useUpdateEndpointMutation() {
  return useApiMutation<Endpoint, { id: string; payload: EndpointPayload }>({
    mutationFn: ({ id, payload }) =>
      apiFetch<Endpoint>(`/admin/api/endpoints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    invalidateKeys: [queryKeys.endpoints.list(), queryKeys.collections.list()],
  });
}

export function useDeleteEndpointMutation() {
  return useApiMutation<{ success: boolean }, string>({
    mutationFn: (id) =>
      apiFetch<{ success: boolean }>(`/admin/api/endpoints/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: [queryKeys.endpoints.list()],
  });
}
