export const queryKeys = {
  endpoints: {
    all: ["endpoints"] as const,
    list: () => [...queryKeys.endpoints.all, "list"] as const,
    detail: (id: string) => [...queryKeys.endpoints.all, "detail", id] as const,
  },
  settings: {
    all: ["settings"] as const,
    detail: () => [...queryKeys.settings.all, "detail"] as const,
  },
};
