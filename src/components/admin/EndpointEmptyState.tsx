"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEndpoints } from "@/components/admin/EndpointContext";

type EndpointEmptyStateProps = {
  variant: "no-collections" | "no-endpoints";
};

export function EndpointEmptyState({ variant }: EndpointEmptyStateProps) {
  const { collections, startCreate } = useEndpoints();
  const firstCollectionId = collections[0]?.id;

  if (variant === "no-collections") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Создайте первую коллекцию
        </h2>
        <p className="max-w-md text-zinc-500">
          Коллекции группируют mock endpoint&apos;ы. URL будет вида{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
            /api/{"{collection}"}/...
          </code>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Создайте первый mock endpoint
      </h2>
      <p className="max-w-md text-zinc-500">
        Выберите коллекцию в сайдбаре и нажмите «+», либо создайте endpoint здесь.
        Клиентские приложения обращаются к{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
          /api/{"{collection}"}/...
        </code>
      </p>
      {firstCollectionId ? (
        <Button size="lg" asChild>
          <Link
            href={`/?mode=create&collection=${firstCollectionId}`}
            onClick={() => startCreate(firstCollectionId)}
          >
            Создать endpoint
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
