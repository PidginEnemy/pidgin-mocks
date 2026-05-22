"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/hooks/settings";
import { getErrorMessage } from "@/lib/api/errors";
import { DEFAULT_PORT } from "@/lib/settings/constants";

export function PortSettingsForm() {
  const { data, isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();
  const [draftPort, setDraftPort] = useState<string | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);

  const configuredPort = data?.port ?? DEFAULT_PORT;
  const port = draftPort ?? String(configuredPort);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPort = Number(port);
    if (!Number.isInteger(nextPort)) {
      toast.error("Порт должен быть целым числом");
      return;
    }

    if (data && nextPort === data.port && nextPort === data.runtimePort) {
      toast.message("Порт не изменился");
      return;
    }

    try {
      const result = await updateMutation.mutateAsync({ port: nextPort });

      if (result.restarted) {
        setIsRestarting(true);
        setDraftPort(null);
        toast.message("Перезапуск приложения…");
        return;
      }

      setDraftPort(null);
      toast.success("Порт сохранён");
    } catch (error) {
      toast.error(getErrorMessage(error, "Не удалось сохранить порт"));
    }
  }

  const saving = updateMutation.isPending || isRestarting;

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 flex flex-col gap-1">
            <Label htmlFor="port" className="text-white">Порт</Label>
            <Input
              id="port"
              name="port"
              type="number"
              min={1024}
              max={65535}
              step={1}
              inputMode="numeric"
              value={port}
              onChange={(event) => setDraftPort(event.target.value)}
              disabled={isLoading || saving}
              className="max-w-[12rem] text-white"
            />
            <p className="text-sm text-zinc-500">
              При смене порта приложение автоматически перезапустится. Mock API
              будет доступен по адресу{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                http://localhost:{port || "…"}/api
              </code>
              .
            </p>
            {data && data.runtimePort !== data.port && !isRestarting && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Сейчас сервер слушает порт {data.runtimePort}. Сохраните настройки,
                чтобы применить порт {data.port}.
              </p>
            )}
            {isRestarting && (
              <p className="text-sm text-zinc-500">
                Перезапуск… поменяйте порт в ссылке и зайдите на страницу снова.
              </p>
            )}
          </div>
          <Button type="submit" disabled={isLoading || saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
