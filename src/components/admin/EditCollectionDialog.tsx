"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useUpdateCollectionMutation } from "@/hooks/collections";
import { getErrorMessage } from "@/lib/api/errors";
import { slugifyCollectionName } from "@/lib/collections/slug";
import type { Collection } from "@/lib/types/collection";

type EditCollectionDialogProps = {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EditCollectionForm({
  collection,
  onOpenChange,
}: {
  collection: Collection;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(collection.name);
  const updateMutation = useUpdateCollectionMutation();
  const slugPreview = name.trim() ? slugifyCollectionName(name) : "";

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Укажите имя коллекции");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: collection.id,
        payload: { name: name.trim() },
      });
      toast.success("Коллекция обновлена");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Ошибка сохранения коллекции"));
    }
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Переименовать коллекцию</AlertDialogTitle>
        <AlertDialogDescription>
          Slug в URL mock API пересчитается автоматически:{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            /api/{"{slug}"}/...
          </code>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="space-y-2 py-2">
        <Label htmlFor="editCollectionName">Имя</Label>
        <Input
          id="editCollectionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {slugPreview ? (
          <p className="text-xs text-zinc-500">
            Slug в URL:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {slugPreview}
            </code>
          </p>
        ) : null}
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Отмена</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
}: EditCollectionDialogProps) {
  if (!collection) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <EditCollectionForm
        key={collection.id}
        collection={collection}
        onOpenChange={onOpenChange}
      />
    </AlertDialog>
  );
}
