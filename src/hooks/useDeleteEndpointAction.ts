"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEndpoints } from "@/components/admin/EndpointContext";
import { useDeleteEndpointMutation } from "@/hooks/endpoints";
import { getErrorMessage } from "@/lib/api/errors";

export function useDeleteEndpointAction() {
  const router = useRouter();
  const { selectedId, refreshEndpoints, selectEndpoint, setView } =
    useEndpoints();
  const deleteMutation = useDeleteEndpointMutation();

  async function deleteEndpoint(endpointId: string) {
    await deleteMutation.mutateAsync(endpointId);
    const remaining = await refreshEndpoints();
    toast.success("Endpoint удалён");

    if (remaining.length === 0) {
      setView("empty");
      router.replace("/");
      return;
    }

    const nextSelected =
      remaining.find((e) => e.id === selectedId)?.id ?? remaining[0].id;

    if (nextSelected !== selectedId) {
      selectEndpoint(nextSelected);
      router.replace(`/?endpoint=${nextSelected}`);
    }
  }

  async function deleteEndpointWithToast(endpointId: string) {
    try {
      await deleteEndpoint(endpointId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Ошибка удаления"));
      throw error;
    }
  }

  return {
    deleteEndpoint: deleteEndpointWithToast,
    isDeleting: deleteMutation.isPending,
  };
}
