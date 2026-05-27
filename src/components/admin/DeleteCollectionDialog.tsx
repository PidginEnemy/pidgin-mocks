"use client";

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
import type { Collection } from "@/lib/types/collection";

type DeleteCollectionDialogProps = {
  collection: Collection | null;
  endpointCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
};

export function DeleteCollectionDialog({
  collection,
  endpointCount,
  open,
  onOpenChange,
  onConfirm,
  deleting,
}: DeleteCollectionDialogProps) {
  if (!collection) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить коллекцию?</AlertDialogTitle>
          <AlertDialogDescription>
            Будет удалена коллекция{" "}
            <strong>{collection.name}</strong>.{" "}
            {endpointCount > 0 ? (
              <>
                Все связанные mock endpoint&apos;ы ({endpointCount}) будут
                удалены навсегда.
              </>
            ) : (
              <>В коллекции нет endpoint&apos;ов.</>
            )}{" "}
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={deleting}
          >
            {deleting ? "Удаление..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
