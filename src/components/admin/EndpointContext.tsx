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
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<WorkspaceView>("empty");
  const initialLoadDone = useRef(false);

  const refreshEndpoints = useCallback(async () => {
    const response = await fetch("/admin/api/endpoints");
    if (!response.ok) {
      throw new Error("Failed to load endpoints");
    }
    const data = (await response.json()) as Endpoint[];
    setEndpoints(data);
    return data;
  }, []);

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
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    refreshEndpoints()
      .then((data) => {
        if (data.length === 0) {
          setView("empty");
          setSelectedId(null);
        }
      })
      .catch(() => {
        setEndpoints([]);
        setView("empty");
      })
      .finally(() => setLoading(false));
  }, [refreshEndpoints]);

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
      loading,
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
      loading,
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
