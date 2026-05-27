"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollectionAccordion } from "@/components/admin/CollectionAccordion";
import { CreateCollectionDialog } from "@/components/admin/CreateCollectionDialog";
import { DeleteCollectionDialog } from "@/components/admin/DeleteCollectionDialog";
import { DeleteEndpointDialog } from "@/components/admin/DeleteEndpointDialog";
import { EditCollectionDialog } from "@/components/admin/EditCollectionDialog";
import { useEndpoints } from "@/components/admin/EndpointContext";
import { useDeleteCollectionAction } from "@/hooks/useDeleteCollectionAction";
import { useDeleteEndpointAction } from "@/hooks/useDeleteEndpointAction";
import type { Endpoint } from "@/lib/types/endpoint";
import type { Collection } from "@/lib/types/collection";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    collections,
    endpointsByCollection,
    loading,
    selectedId,
    selectEndpoint,
    startCreate,
  } = useEndpoints();
  const { deleteEndpoint, isDeleting } = useDeleteEndpointAction();
  const {
    deleteCollection: deleteCollectionAction,
    isDeleting: isDeletingCollection,
  } = useDeleteCollectionAction();
  const isSettings = pathname === "/settings";
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [editCollectionOpen, setEditCollectionOpen] = useState(false);
  const [editCollectionTarget, setEditCollectionTarget] =
    useState<Collection | null>(null);
  const [deleteCollectionOpen, setDeleteCollectionOpen] = useState(false);
  const [deleteCollectionTarget, setDeleteCollectionTarget] =
    useState<Collection | null>(null);

  const hasEndpoints = useMemo(
    () => collections.some((c) => (endpointsByCollection.get(c.id)?.length ?? 0) > 0),
    [collections, endpointsByCollection],
  );

  function openDeleteDialog(endpoint: Endpoint) {
    setDeleteTarget(endpoint);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEndpoint(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      // toast already shown in hook
    }
  }

  function handleCreateInCollection(collectionId: string) {
    startCreate(collectionId);
    router.push(`/?mode=create&collection=${collectionId}`);
  }

  async function handleConfirmDeleteCollection() {
    if (!deleteCollectionTarget) return;
    try {
      await deleteCollectionAction(deleteCollectionTarget.id);
      setDeleteCollectionOpen(false);
      setDeleteCollectionTarget(null);
    } catch {
      // toast already shown in hook
    }
  }

  function openEditCollection(collection: Collection) {
    setEditCollectionTarget(collection);
    setEditCollectionOpen(true);
  }

  function openDeleteCollection(collection: Collection) {
    setDeleteCollectionTarget(collection);
    setDeleteCollectionOpen(true);
  }

  return (
    <aside className="flex h-full w-[280px] min-w-[280px] max-w-[280px] shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            PM
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Pidgin Mocks
            </p>
            <p className="text-xs text-zinc-500">Mock API Generator</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mb-2 w-full justify-start"
          asChild
        >
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            Общие настройки
          </Link>
        </Button>
        <Button
          className="w-full justify-start"
          onClick={() => setCreateCollectionOpen(true)}
        >
          <FolderPlus className="h-4 w-4" />
          Новая коллекция
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-2">
        {loading ? (
          <p className="px-3 py-2 text-sm text-zinc-500">Загрузка...</p>
        ) : collections.length === 0 ? (
          <p className="px-3 py-2 text-sm text-zinc-500">Нет коллекций</p>
        ) : (
          <div className="w-full min-w-0 space-y-2">
            {collections.map((collection, index) => (
              <CollectionAccordion
                key={collection.id}
                collection={collection}
                endpoints={endpointsByCollection.get(collection.id) ?? []}
                selectedId={selectedId}
                isSettings={isSettings}
                defaultOpen={index === 0 || hasEndpoints}
                onSelectEndpoint={selectEndpoint}
                onDeleteEndpoint={openDeleteDialog}
                onCreateInCollection={handleCreateInCollection}
                onEditCollection={openEditCollection}
                onDeleteCollection={openDeleteCollection}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteEndpointDialog
        endpoint={deleteTarget}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        deleting={isDeleting}
      />

      <CreateCollectionDialog
        open={createCollectionOpen}
        onOpenChange={setCreateCollectionOpen}
      />

      <EditCollectionDialog
        collection={editCollectionTarget}
        open={editCollectionOpen}
        onOpenChange={(open) => {
          setEditCollectionOpen(open);
          if (!open) setEditCollectionTarget(null);
        }}
      />

      <DeleteCollectionDialog
        collection={deleteCollectionTarget}
        endpointCount={
          deleteCollectionTarget
            ? (endpointsByCollection.get(deleteCollectionTarget.id)?.length ?? 0)
            : 0
        }
        open={deleteCollectionOpen}
        onOpenChange={(open) => {
          setDeleteCollectionOpen(open);
          if (!open) setDeleteCollectionTarget(null);
        }}
        onConfirm={handleConfirmDeleteCollection}
        deleting={isDeletingCollection}
      />
    </aside>
  );
}
