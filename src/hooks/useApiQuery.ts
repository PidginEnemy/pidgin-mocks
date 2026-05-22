"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

type UseApiQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error>,
  "queryFn"
> & {
  url: string;
  init?: RequestInit;
};

export function useApiQuery<TData>({
  url,
  init,
  ...options
}: UseApiQueryOptions<TData>) {
  return useQuery({
    ...options,
    queryFn: () => apiFetch<TData>(url, init),
  });
}
