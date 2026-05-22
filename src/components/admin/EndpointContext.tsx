"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useEndpointsQuery } from "@/hooks/endpoints";
import type { Endpoint } from "@/lib/types/endpoint";

export type WorkspaceView = "empty" | "create" | "edit";

type EndpointContextValue = {
  endpoints: Endpoint[];
  loading: boolean;
  selectedId: string | null;
  view: WorkspaceView;
  refreshEndpoints: () => Promise<Endpoint[]>;
  selectEndpoint: (id: string) => void;
  startCreate: () => void;
  setView: (view: WorkspaceView) => void;
  syncFromSearchParams: (endpointId: string | null, mode: string | null) => void;
};

const EndpointContext = createContext<EndpointContextValue | null>(null);

export function EndpointProvider({ children }: { children: ReactNode }) {
  const {
    data: endpoints = [],
    isLoading,
    isError,
    refetch,
  } = useEndpointsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<WorkspaceView>("empty");
  const initialViewSet = useRef(false);

  const refreshEndpoints = useCallback(async () => {
    const result = await refetch();
    return result.data ?? [];
  }, [refetch]);

  const syncFromSearchParams = useCallback(
    (endpointId: string | null, mode: string | null) => {
      if (mode === "create") {
        setSelectedId(null);
        setView("create");
        return;
      }

      if (endpoints.length === 0) {
        setSelectedId(null);
        setView("empty");
        return;
      }

      if (endpointId && endpoints.some((e) => e.id === endpointId)) {
        setSelectedId(endpointId);
        setView("edit");
        return;
      }

      setSelectedId(endpoints[0].id);
      setView("edit");
    },
    [endpoints],
  );

  useEffect(() => {
    if (isLoading || initialViewSet.current) return;
    initialViewSet.current = true;

    if (isError || endpoints.length === 0) {
      setView("empty");
      setSelectedId(null);
    }
  }, [isLoading, isError, endpoints.length]);

  const selectEndpoint = useCallback((id: string) => {
    setSelectedId(id);
    setView("edit");
  }, []);

  const startCreate = useCallback(() => {
    setSelectedId(null);
    setView("create");
  }, []);

  const value = useMemo(
    () => ({
      endpoints,
      loading: isLoading,
      selectedId,
      view,
      refreshEndpoints,
      selectEndpoint,
      startCreate,
      setView,
      syncFromSearchParams,
    }),
    [
      endpoints,
      isLoading,
      selectedId,
      view,
      refreshEndpoints,
      selectEndpoint,
      startCreate,
      syncFromSearchParams,
    ],
  );

  return (
    <EndpointContext.Provider value={value}>{children}</EndpointContext.Provider>
  );
}

export function useEndpoints() {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error("useEndpoints must be used within EndpointProvider");
  }
  return context;
}
