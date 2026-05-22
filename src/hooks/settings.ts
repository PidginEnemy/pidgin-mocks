"use client";

import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";

export type AppSettingsResponse = {
  port: number;
  runtimePort: number;
  restarted?: boolean;
};

export function useSettingsQuery() {
  return useApiQuery<AppSettingsResponse>({
    queryKey: queryKeys.settings.detail(),
    url: "/admin/api/settings",
  });
}

export function useUpdateSettingsMutation() {
  return useApiMutation<AppSettingsResponse, { port: number }>({
    mutationFn: (payload) =>
      apiFetch<AppSettingsResponse>("/admin/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    invalidateKeys: [queryKeys.settings.detail()],
  });
}
