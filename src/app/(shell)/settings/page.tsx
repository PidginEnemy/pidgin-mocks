import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortSettingsForm } from "@/components/settings/PortSettingsForm";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto p-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Общие настройки
          </h1>
          <p className="mt-2 text-zinc-500">
            Параметры локального mock-сервера. CORS и дополнительные опции
            появятся позже.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
          <p>
            Текущий префикс mock API:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">/api</code>
          </p>
          <p className="mt-2">
            База данных:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              data/mocks.db
            </code>
          </p>
          <p className="mt-2">
            Файл настроек:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              data/settings.json
            </code>
          </p>
        </div>
        <PortSettingsForm />
      </div>
    </div>
  );
}
