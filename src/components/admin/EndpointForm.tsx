"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { JsonResponseEditor } from "@/components/admin/JsonResponseEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DeleteEndpointDialog } from "@/components/admin/DeleteEndpointDialog";
import { useEndpoints } from "@/components/admin/EndpointContext";
import { HTTP_METHODS, type Endpoint, type HttpMethod } from "@/lib/types/endpoint";

type EndpointFormProps = {
  mode: "create" | "edit";
  endpoint?: Endpoint;
};

const defaultBody = '{\n  "message": "Hello from mock"\n}';

export function EndpointForm({ mode, endpoint }: EndpointFormProps) {
  const router = useRouter();
  const { refreshEndpoints, selectEndpoint, setView } = useEndpoints();
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("/");
  const [statusCode, setStatusCode] = useState("200");
  const [responseBody, setResponseBody] = useState(defaultBody);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (mode === "edit" && endpoint) {
      setMethod(endpoint.method);
      setPath(endpoint.path);
      setStatusCode(String(endpoint.statusCode));
      setResponseBody(
        JSON.stringify(JSON.parse(endpoint.responseBody), null, 2),
      );
    } else if (mode === "create") {
      setMethod("GET");
      setPath("/");
      setStatusCode("200");
      setResponseBody(defaultBody);
    }
    setJsonError(null);
  }, [mode, endpoint]);

  function validateJson(value: string): boolean {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch {
      setJsonError("Невалидный JSON");
      return false;
    }
  }

  async function handleSave() {
    if (!validateJson(responseBody)) return;

    setSaving(true);
    try {
      const payload = {
        method,
        path,
        statusCode: Number(statusCode),
        responseBody,
      };

      const url =
        mode === "create"
          ? "/admin/api/endpoints"
          : `/admin/api/endpoints/${endpoint?.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Ошибка сохранения");
      }

      const updated = await refreshEndpoints();
      toast.success(
        mode === "create" ? "Endpoint создан" : "Endpoint обновлён",
      );

      if (mode === "create") {
        selectEndpoint(data.id);
        router.replace(`/?endpoint=${data.id}`);
      } else {
        const current = updated.find((e) => e.id === endpoint?.id);
        if (current) {
          selectEndpoint(current.id);
          router.replace(`/?endpoint=${current.id}`);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!endpoint) return;
    setDeleting(true);
    try {
      const response = await fetch(`/admin/api/endpoints/${endpoint.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Ошибка удаления");
      }

      const remaining = await refreshEndpoints();
      setDeleteOpen(false);
      toast.success("Endpoint удалён");

      if (remaining.length === 0) {
        setView("empty");
        router.replace("/");
      } else {
        selectEndpoint(remaining[0].id);
        router.replace(`/?endpoint=${remaining[0].id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка удаления");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto p-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {mode === "create" ? "Новый endpoint" : "Редактирование endpoint"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Итоговый URL:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              {origin
                ? `${origin}/api${path === "/" ? "" : path}`
                : `/api${path === "/" ? "" : path}`}
            </code>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="method">HTTP-метод</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusCode">Статус-код</Label>
            <Input
              id="statusCode"
              type="number"
              min={100}
              max={599}
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="path">Путь</Label>
          <Input
            id="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/users"
          />
        </div>

        <JsonResponseEditor
          id="responseBody"
          value={responseBody}
          onChange={(value) => {
            setResponseBody(value);
            if (jsonError) validateJson(value);
          }}
          onBlur={() => validateJson(responseBody)}
          error={jsonError}
        />

        <div className="flex items-center justify-between gap-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
          {mode === "edit" && endpoint && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={deleting}
              >
                Удалить
              </Button>
              <DeleteEndpointDialog
                endpoint={endpoint}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                deleting={deleting}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
