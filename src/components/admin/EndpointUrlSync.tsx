"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useEndpoints } from "@/components/admin/EndpointContext";

export function EndpointUrlSync() {
  const searchParams = useSearchParams();
  const { loading, syncFromSearchParams } = useEndpoints();
  const lastAppliedQuery = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const query = searchParams.toString();
    if (query === lastAppliedQuery.current) return;
    lastAppliedQuery.current = query;

    syncFromSearchParams(
      searchParams.get("endpoint"),
      searchParams.get("mode"),
    );
  }, [loading, searchParams, syncFromSearchParams]);

  return null;
}
