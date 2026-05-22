"use client";

import { useMemo } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import { AlignLeft, Braces, Copy, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

type JsonResponseEditorProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  className?: string;
};

function parseJson(value: string): { ok: true; data: unknown } | { ok: false } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch {
    return { ok: false };
  }
}

export function JsonResponseEditor({
  id = "responseBody",
  label = "JSON-ответ",
  value,
  onChange,
  onBlur,
  error,
  className,
}: JsonResponseEditorProps) {
  const validation = useMemo(() => parseJson(value), [value]);

  function formatJson() {
    const parsed = parseJson(value);
    if (!parsed.ok) {
      toast.error("Невалидный JSON — исправьте перед форматированием");
      return;
    }
    onChange(JSON.stringify(parsed.data, null, 2));
    toast.success("JSON отформатирован");
  }

  function minifyJson() {
    const parsed = parseJson(value);
    if (!parsed.ok) {
      toast.error("Невалидный JSON — исправьте перед сжатием");
      return;
    }
    onChange(JSON.stringify(parsed.data));
    toast.success("JSON сжат");
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Скопировано в буфер обмена");
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Badge variant={validation.ok ? "success" : "destructive"}>
          {validation.ok ? "Валидный JSON" : "Ошибка JSON"}
        </Badge>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-normal text-zinc-500">
            <Braces className="h-3.5 w-3.5" />
            Редактор JSON
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={formatJson}
            >
              <AlignLeft className="mr-1 h-3.5 w-3.5" />
              Формат
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={minifyJson}
            >
              <Minimize2 className="mr-1 h-3.5 w-3.5" />
              Сжать
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={copyJson}
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Копировать
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className={cn(
              "json-response-editor relative min-h-[260px] border-t border-zinc-200 bg-zinc-950 dark:border-zinc-800",
              !validation.ok && "ring-1 ring-inset ring-red-500/40",
            )}
          >
            <Editor
              value={value}
              onValueChange={onChange}
              onBlur={onBlur}
              highlight={(code) =>
                highlight(code, languages.json, "json")
              }
              padding={16}
              tabSize={2}
              insertSpaces
              textareaClassName="json-response-editor__textarea"
              preClassName="json-response-editor__pre"
              style={{
                minHeight: 260,
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
