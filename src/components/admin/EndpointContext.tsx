"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCollectionsQuery } from "@/hooks/collections";
import { useEndpointsQuery } from "@/hooks/endpoints";
import type { Collection } from "@/lib/types/collection";
import type { Endpoint } from "@/lib/types/endpoint";

export type WorkspaceView = "empty" | "create" | "edit";

type EndpointContextValue = {
  collections: Collection[];
  endpoints: Endpoint[];
  endpointsByCollection: Map<string, Endpoint[]>;
  loading: boolean;
  selectedId: string | null;
  createCollectionId: string | null;
  view: WorkspaceView;
  refreshEndpoints: () => Promise<Endpoint[]>;
  refreshCollections: () => Promise<Collection[]>;
  selectEndpoint: (id: string) => void;
  startCreate: (collectionId?: string) => void;
  setView: (view: WorkspaceView) => void;
  syncFromSearchParams: (
    endpointId: string | null,
    mode: string | null,
    collectionId: string | null,
  ) => void;
};

const EndpointContext = createContext<EndpointContextValue | null>(null);

function groupEndpointsByCollection(
  endpoints: Endpoint[],
): Map<string, Endpoint[]> {
  const map = new Map<string, Endpoint[]>();
  for (const endpoint of endpoints) {
    const list = map.get(endpoint.collectionId) ?? [];
    list.push(endpoint);
    map.set(endpoint.collectionId, list);
  }
  return map;
}

export function EndpointProvider({ children }: { children: ReactNode }) {
  const {
    data: collections = [],
    isLoading: collectionsLoading,
    isError: collectionsError,
    refetch: refetchCollections,
  } = useCollectionsQuery();
  const {
    data: endpoints = [],
    isLoading: endpointsLoading,
    isError: endpointsError,
    refetch,
  } = useEndpointsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createCollectionId, setCreateCollectionId] = useState<string | null>(
    null,
  );
  const [view, setView] = useState<WorkspaceView>("empty");

  const loading = collectionsLoading || endpointsLoading;
  const isError = collectionsError || endpointsError;
  const effectiveView: WorkspaceView =
    isError || collections.length === 0 ? "empty" : view;
  const effectiveSelectedId = effectiveView === "empty" ? null : selectedId;
  const effectiveCreateCollectionId =
    effectiveView === "empty" ? null : createCollectionId;

  const endpointsByCollection = useMemo(
    () => groupEndpointsByCollection(endpoints),
    [endpoints],
  );

  const refreshEndpoints = useCallback(async () => {
    const result = await refetch();
    return result.data ?? [];
  }, [refetch]);

  const refreshCollections = useCallback(async () => {
    const result = await refetchCollections();
    return result.data ?? [];
  }, [refetchCollections]);

  const syncFromSearchParams = useCallback(
    (
      endpointId: string | null,
      mode: string | null,
      collectionId: string | null,
    ) => {
      if (mode === "create") {
        setSelectedId(null);
        const resolvedCollectionId =
          collectionId && collections.some((c) => c.id === collectionId)
            ? collectionId
            : (collections[0]?.id ?? null);
        setCreateCollectionId(resolvedCollectionId);
        setView("create");
        return;
      }

      if (collections.length === 0) {
        setSelectedId(null);
        setCreateCollectionId(null);
        setView("empty");
        return;
      }

      if (endpointId && endpoints.some((e) => e.id === endpointId)) {
        setSelectedId(endpointId);
        setCreateCollectionId(null);
        setView("edit");
        return;
      }

      if (endpoints.length === 0) {
        setSelectedId(null);
        setCreateCollectionId(null);
        setView("empty");
        return;
      }

      setSelectedId(endpoints[0].id);
      setCreateCollectionId(null);
      setView("edit");
    },
    [collections, endpoints],
  );

  const selectEndpoint = useCallback((id: string) => {
    setSelectedId(id);
    setCreateCollectionId(null);
    setView("edit");
  }, []);

  const startCreate = useCallback(
    (collectionId?: string) => {
      setSelectedId(null);
      const resolved =
        collectionId && collections.some((c) => c.id === collectionId)
          ? collectionId
          : (collections[0]?.id ?? null);
      setCreateCollectionId(resolved);
      setView("create");
    },
    [collections],
  );

  const value = useMemo(
    () => ({
      collections,
      endpoints,
      endpointsByCollection,
      loading,
      selectedId: effectiveSelectedId,
      createCollectionId: effectiveCreateCollectionId,
      view: effectiveView,
      refreshEndpoints,
      refreshCollections,
      selectEndpoint,
      startCreate,
      setView,
      syncFromSearchParams,
    }),
    [
      collections,
      endpoints,
      endpointsByCollection,
      loading,
      effectiveSelectedId,
      effectiveCreateCollectionId,
      effectiveView,
      refreshEndpoints,
      refreshCollections,
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
