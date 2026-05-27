"use client";

import { useMemo } from "react";
import { EndpointEmptyState } from "@/components/admin/EndpointEmptyState";
import { EndpointForm } from "@/components/admin/EndpointForm";
import { useEndpoints } from "@/components/admin/EndpointContext";

export function EndpointWorkspace() {
  const {
    collections,
    endpoints,
    loading,
    selectedId,
    createCollectionId,
    view,
  } = useEndpoints();

  const selectedEndpoint = useMemo(
    () => endpoints.find((e) => e.id === selectedId) ?? null,
    [endpoints, selectedId],
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500">
        Загрузка...
      </div>
    );
  }

  if (collections.length === 0) {
    return <EndpointEmptyState variant="no-collections" />;
  }

  if (view === "create") {
    return (
      <EndpointForm
        mode="create"
        defaultCollectionId={createCollectionId ?? collections[0]?.id}
      />
    );
  }

  if (view === "empty" || endpoints.length === 0) {
    return <EndpointEmptyState variant="no-endpoints" />;
  }

  if (view === "edit" && selectedEndpoint) {
    return <EndpointForm mode="edit" endpoint={selectedEndpoint} />;
  }

  return <EndpointEmptyState variant="no-endpoints" />;
}
