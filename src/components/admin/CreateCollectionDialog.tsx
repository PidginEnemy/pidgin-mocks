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
import { useCreateCollectionMutation } from "@/hooks/collections";
import { getErrorMessage } from "@/lib/api/errors";
import { slugifyCollectionName } from "@/lib/collections/slug";

type CreateCollectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateCollectionDialog({
  open,
  onOpenChange,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState("");
  const createMutation = useCreateCollectionMutation();
  const slugPreview = name.trim() ? slugifyCollectionName(name) : "";

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Укажите имя коллекции");
      return;
    }

    try {
      await createMutation.mutateAsync({ name: name.trim() });
      toast.success("Коллекция создана");
      setName("");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Ошибка создания коллекции"));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Новая коллекция</AlertDialogTitle>
          <AlertDialogDescription>
            Имя коллекции используется в URL mock API:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              /api/{"{slug}"}/...
            </code>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="collectionName">Имя</Label>
          <Input
            id="collectionName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Common"
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
              void handleCreate();
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Создание..." : "Создать"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
