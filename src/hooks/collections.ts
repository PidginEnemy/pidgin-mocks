"use client";

import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { Collection } from "@/lib/types/collection";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

export type CollectionPayload = {
  name: string;
};

export function useCollectionsQuery() {
  return useApiQuery<Collection[]>({
    queryKey: queryKeys.collections.list(),
    url: "/admin/api/collections",
  });
}

export function useCreateCollectionMutation() {
  return useApiMutation<Collection, CollectionPayload>({
    mutationFn: (payload) =>
      apiFetch<Collection>("/admin/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    invalidateKeys: [queryKeys.collections.list(), queryKeys.endpoints.list()],
  });
}

export function useUpdateCollectionMutation() {
  return useApiMutation<
    Collection,
    { id: string; payload: CollectionPayload }
  >({
    mutationFn: ({ id, payload }) =>
      apiFetch<Collection>(`/admin/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    invalidateKeys: [queryKeys.collections.list(), queryKeys.endpoints.list()],
  });
}

export function useDeleteCollectionMutation() {
  return useApiMutation<{ success: boolean }, string>({
    mutationFn: (id) =>
      apiFetch<{ success: boolean }>(`/admin/api/collections/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: [queryKeys.collections.list(), queryKeys.endpoints.list()],
  });
}
