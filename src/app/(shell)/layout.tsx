import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { EndpointProvider } from "@/components/admin/EndpointContext";
import { EndpointUrlSync } from "@/components/admin/EndpointUrlSync";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EndpointProvider>
      <AdminShell>
        <Suspense fallback={null}>
          <EndpointUrlSync />
        </Suspense>
        {children}
      </AdminShell>
    </EndpointProvider>
  );
}
