"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEndpoints } from "@/components/admin/EndpointContext";

export function EndpointEmptyState() {
  const { startCreate } = useEndpoints();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Создайте первый mock endpoint
      </h2>
      <p className="max-w-md text-zinc-500">
        Настройте путь, HTTP-метод, статус-код и JSON-ответ. Клиентские
        приложения смогут обращаться к{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800">
          /api/...
        </code>
      </p>
      <Button size="lg" asChild>
        <Link href="/?mode=create" onClick={() => startCreate()}>
          Создать
        </Link>
      </Button>
    </div>
  );
}
