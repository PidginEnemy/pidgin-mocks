"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-auto bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar />
      <main className="flex min-w-3xl flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
