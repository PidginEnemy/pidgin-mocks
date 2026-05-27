"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEndpoints } from "@/components/admin/EndpointContext";
import { useDeleteCollectionMutation } from "@/hooks/collections";
import { getErrorMessage } from "@/lib/api/errors";

export function useDeleteCollectionAction() {
  const router = useRouter();
  const {
    refreshEndpoints,
    refreshCollections,
    selectEndpoint,
    startCreate,
    setView,
  } = useEndpoints();
  const deleteMutation = useDeleteCollectionMutation();

  async function deleteCollection(collectionId: string) {
    await deleteMutation.mutateAsync(collectionId);
    const [endpoints, collections] = await Promise.all([
      refreshEndpoints(),
      refreshCollections(),
    ]);
    toast.success("Коллекция удалена");

    if (collections.length === 0) {
      setView("empty");
      router.replace("/");
      return;
    }

    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const mode = params.get("mode");
    const ep = params.get("endpoint");
    const coll = params.get("collection");

    if (mode === "create" && coll === collectionId) {
      const firstCol = collections[0].id;
      startCreate(firstCol);
      router.replace(`/?mode=create&collection=${firstCol}`);
      return;
    }

    if (
      mode === "create" &&
      coll &&
      !collections.some((c) => c.id === coll)
    ) {
      const firstCol = collections[0].id;
      startCreate(firstCol);
      router.replace(`/?mode=create&collection=${firstCol}`);
      return;
    }

    if (ep && !endpoints.some((e) => e.id === ep)) {
      if (endpoints.length === 0) {
        setView("empty");
        router.replace("/");
        return;
      }
      selectEndpoint(endpoints[0].id);
      router.replace(`/?endpoint=${endpoints[0].id}`);
    }
  }

  async function deleteCollectionWithToast(collectionId: string) {
    try {
      await deleteCollection(collectionId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Ошибка удаления коллекции"));
      throw error;
    }
  }

  return {
    deleteCollection: deleteCollectionWithToast,
    isDeleting: deleteMutation.isPending,
  };
}
