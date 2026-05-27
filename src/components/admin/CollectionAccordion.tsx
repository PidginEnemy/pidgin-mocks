"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { COMMON_COLLECTION_ID } from "@/lib/collections/constants";
import { EndpointListItem } from "@/components/admin/EndpointListItem";
import type { Collection } from "@/lib/types/collection";
import type { Endpoint } from "@/lib/types/endpoint";

type CollectionAccordionProps = {
  collection: Collection;
  endpoints: Endpoint[];
  selectedId: string | null;
  isSettings: boolean;
  defaultOpen?: boolean;
  onSelectEndpoint: (id: string) => void;
  onDeleteEndpoint: (endpoint: Endpoint) => void;
  onCreateInCollection: (collectionId: string) => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collection: Collection) => void;
};

export function CollectionAccordion({
  collection,
  endpoints,
  selectedId,
  isSettings,
  defaultOpen = true,
  onSelectEndpoint,
  onDeleteEndpoint,
  onCreateInCollection,
  onEditCollection,
  onDeleteCollection,
}: CollectionAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const canDeleteCollection = collection.id !== COMMON_COLLECTION_ID;

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-md border border-transparent">
      <div className="group/coll flex w-full min-w-0 max-w-full items-center gap-0.5 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 basis-0 items-center gap-1.5 overflow-hidden rounded-md px-2 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-zinc-500 transition-transform",
              !open && "-rotate-90",
            )}
          />
          <span className="min-w-0 truncate" title={collection.name}>
            {collection.name}
          </span>
        </button>
        <span className="w-6 shrink-0 text-center text-xs font-normal tabular-nums text-zinc-500">
          {endpoints.length}
        </span>
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Редактировать коллекцию ${collection.name}`}
            onClick={() => onEditCollection(collection)}
            className="text-zinc-500 opacity-0 transition-opacity hover:text-zinc-900 group-hover/coll:opacity-100 focus-visible:opacity-100 dark:hover:text-zinc-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {canDeleteCollection ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Удалить коллекцию ${collection.name}`}
              onClick={() => onDeleteCollection(collection)}
              className="text-zinc-500 opacity-0 transition-opacity hover:text-red-600 group-hover/coll:opacity-100 focus-visible:opacity-100 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Новый endpoint в ${collection.name}`}
            onClick={() => onCreateInCollection(collection.id)}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="mb-2 space-y-1 pl-2">
          {endpoints.length === 0 ? (
            <p className="px-3 py-1 text-xs text-zinc-500">Нет endpoint&apos;ов</p>
          ) : (
            endpoints.map((endpoint) => (
              <EndpointListItem
                key={endpoint.id}
                endpoint={endpoint}
                href={`/?endpoint=${endpoint.id}`}
                active={!isSettings && selectedId === endpoint.id}
                onSelect={() => onSelectEndpoint(endpoint.id)}
                onDeleteClick={() => onDeleteEndpoint(endpoint)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
