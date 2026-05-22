"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Endpoint } from "@/lib/types/endpoint";

type EndpointListItemProps = {
  endpoint: Endpoint;
  active: boolean;
  href: string;
  onSelect: () => void;
};

export function EndpointListItem({
  endpoint,
  active,
  href,
  onSelect,
}: EndpointListItemProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        <span className="tabular-nums">{endpoint.statusCode}</span>
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
  );
}
