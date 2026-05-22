"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Endpoint } from "@/lib/types/endpoint";

type EndpointListItemProps = {
  endpoint: Endpoint;
  active: boolean;
  href: string;
  onSelect: () => void;
  onDeleteClick: () => void;
};

function statusCodeColorClass(code: number, active: boolean): string {
  const range = Math.floor(code / 100);

  if (active) {
    switch (range) {
      case 2:
        return "text-emerald-400 dark:text-emerald-600";
      case 3:
        return "text-amber-400 dark:text-amber-600";
      case 4:
        return "text-orange-400 dark:text-orange-600";
      case 5:
        return "text-red-400 dark:text-red-600";
      default:
        return "text-zinc-300 dark:text-zinc-500";
    }
  }

  switch (range) {
    case 2:
      return "text-emerald-600 dark:text-emerald-400";
    case 3:
      return "text-amber-600 dark:text-amber-400";
    case 4:
      return "text-orange-600 dark:text-orange-400";
    case 5:
      return "text-red-600 dark:text-red-400";
    default:
      return "text-zinc-500";
  }
}

export function EndpointListItem({
  endpoint,
  active,
  href,
  onSelect,
  onDeleteClick,
}: EndpointListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-stretch rounded-md transition-colors",
        active
          ? "bg-zinc-900 dark:bg-zinc-100"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
      )}
    >
      <Link
        href={href}
        onClick={onSelect}
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-0.5 py-2 pl-3 pr-1 text-left text-sm",
          active
            ? "text-zinc-50 dark:text-zinc-900"
            : "text-zinc-700 dark:text-zinc-300",
        )}
      >
        <span className="flex items-center gap-2 font-medium">
          <span
            className={cn(
              "tabular-nums",
              statusCodeColorClass(endpoint.statusCode, active),
            )}
          >
            {endpoint.statusCode}
          </span>
          <span className="truncate">{endpoint.path}</span>
        </span>
        <span
          className={cn(
            "text-xs uppercase tracking-wide",
            active ? "text-zinc-300 dark:text-zinc-500" : "text-zinc-500",
          )}
        >
          {endpoint.method}
        </span>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Удалить ${endpoint.method} ${endpoint.path}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDeleteClick();
        }}
        className={cn(
          "mr-1.5 self-center opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          active && "opacity-100",
          active
            ? "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-200 dark:hover:text-zinc-900"
            : "text-zinc-500 hover:bg-zinc-200 hover:text-red-600 dark:hover:bg-zinc-700 dark:hover:text-red-400",
        )}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
