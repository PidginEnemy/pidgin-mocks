"use client";

import { useMemo, useState } from "react";
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
import {
  useCreateEndpointMutation,
  useUpdateEndpointMutation,
} from "@/hooks/endpoints";
import { useDeleteEndpointAction } from "@/hooks/useDeleteEndpointAction";
import { getErrorMessage } from "@/lib/api/errors";
import { HTTP_METHODS, type Endpoint, type HttpMethod } from "@/lib/types/endpoint";

type EndpointFormProps = {
  mode: "create" | "edit";
  endpoint?: Endpoint;
  defaultCollectionId?: string;
};

const defaultBody = '{\n  \n}';

function buildMockUrl(origin: string, collectionSlug: string, path: string) {
  const suffix = path === "/" ? "" : path;
  const base = origin
    ? `${origin}/api/${collectionSlug}${suffix}`
    : `/api/${collectionSlug}${suffix}`;
  return base;
}

function EndpointFormFields({
  mode,
  endpoint,
  defaultCollectionId,
}: EndpointFormProps) {
  const router = useRouter();
  const { collections, refreshEndpoints, selectEndpoint } = useEndpoints();
  const createMutation = useCreateEndpointMutation();
  const updateMutation = useUpdateEndpointMutation();
  const { deleteEndpoint, isDeleting } = useDeleteEndpointAction();
  const initialCollectionId =
    mode === "edit" && endpoint
      ? endpoint.collectionId
      : defaultCollectionId ?? collections[0]?.id ?? "";

  const initialMethod: HttpMethod =
    mode === "edit" && endpoint ? endpoint.method : "GET";

  const initialPath = mode === "edit" && endpoint ? endpoint.path : "/";

  const initialStatusCode =
    mode === "edit" && endpoint ? String(endpoint.statusCode) : "200";

  const initialResponseBody =
    mode === "edit" && endpoint
      ? JSON.stringify(JSON.parse(endpoint.responseBody), null, 2)
      : defaultBody;

  const [collectionId, setCollectionId] = useState(initialCollectionId);
  const [method, setMethod] = useState<HttpMethod>(initialMethod);
  const [path, setPath] = useState(initialPath);
  const [statusCode, setStatusCode] = useState(initialStatusCode);
  const [responseBody, setResponseBody] = useState(initialResponseBody);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [origin] = useState(() =>
    typeof window === "undefined" ? "" : window.location.origin,
  );

  const selectedCollection = useMemo(
    () => collections.find((c) => c.id === collectionId) ?? null,
    [collections, collectionId],
  );

  const saving = createMutation.isPending || updateMutation.isPending;

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
    if (!collectionId) {
      toast.error("Выберите коллекцию");
      return;
    }
    if (!validateJson(responseBody)) return;

    const payload = {
      collectionId,
      method,
      path,
      statusCode: Number(statusCode),
      responseBody,
    };

    try {
      if (mode === "create") {
        const data = await createMutation.mutateAsync(payload);
        toast.success("Endpoint создан");
        selectEndpoint(data.id);
        router.replace(`/?endpoint=${data.id}`);
        return;
      }

      if (!endpoint) return;

      await updateMutation.mutateAsync({ id: endpoint.id, payload });
      const updated = await refreshEndpoints();
      toast.success("Endpoint обновлён");

      const current = updated.find((e) => e.id === endpoint.id);
      if (current) {
        selectEndpoint(current.id);
        router.replace(`/?endpoint=${current.id}`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Ошибка сохранения"));
    }
  }

  async function handleDelete() {
    if (!endpoint) return;

    try {
      await deleteEndpoint(endpoint.id);
      setDeleteOpen(false);
    } catch {
      // toast already shown in hook
    }
  }

  const previewUrl = selectedCollection
    ? buildMockUrl(origin, selectedCollection.slug, path)
    : "";

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
              {previewUrl || "…"}
            </code>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collection">Коллекция</Label>
          <Select value={collectionId} onValueChange={setCollectionId}>
            <SelectTrigger id="collection">
              <SelectValue placeholder="Выберите коллекцию" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            placeholder="/users/{id}"
          />
          <p className="text-xs text-zinc-500">
            Путь внутри коллекции, без префикса{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              /api/{"{collection}"}
            </code>
            . Сегмент в фигурных скобках — динамический параметр. Пример:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              /api/common/users/42
            </code>{" "}
            для коллекции{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              common
            </code>{" "}
            и шаблона{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              /users/{"{id}"}
            </code>
            .
          </p>
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
                disabled={isDeleting}
              >
                Удалить
              </Button>
              <DeleteEndpointDialog
                endpoint={endpoint}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                deleting={isDeleting}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function EndpointForm(props: EndpointFormProps) {
  const key = `${props.mode}:${props.endpoint?.id ?? "new"}:${
    props.defaultCollectionId ?? ""
  }`;

  return <EndpointFormFields key={key} {...props} />;
}
