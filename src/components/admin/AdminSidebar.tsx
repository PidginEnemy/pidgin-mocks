"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { DeleteEndpointDialog } from "@/components/admin/DeleteEndpointDialog";
import { EndpointListItem } from "@/components/admin/EndpointListItem";
import { useEndpoints } from "@/components/admin/EndpointContext";
import { useDeleteEndpointAction } from "@/hooks/useDeleteEndpointAction";
import type { Endpoint } from "@/lib/types/endpoint";

export function AdminSidebar() {
  const pathname = usePathname();
  const { endpoints, loading, selectedId, selectEndpoint, startCreate } =
    useEndpoints();
  const { deleteEndpoint, isDeleting } = useDeleteEndpointAction();
  const isSettings = pathname === "/settings";
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
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
        <Button className="w-full justify-start" asChild>
          <Link
            href="/?mode=create"
            onClick={() => {
              startCreate();
            }}
          >
            <Plus className="h-4 w-4" />
            Новый endpoint
          </Link>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {!mounted || loading ? (
          <p className="px-3 py-2 text-sm text-zinc-500">Загрузка...</p>
        ) : endpoints.length === 0 ? (
          <p className="px-3 py-2 text-sm text-zinc-500">Нет endpoint&apos;ов</p>
        ) : (
          <div className="space-y-1">
            {endpoints.map((endpoint) => (
              <EndpointListItem
                key={endpoint.id}
                endpoint={endpoint}
                href={`/?endpoint=${endpoint.id}`}
                active={!isSettings && selectedId === endpoint.id}
                onSelect={() => selectEndpoint(endpoint.id)}
                onDeleteClick={() => openDeleteDialog(endpoint)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

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
    </aside>
  );
}
