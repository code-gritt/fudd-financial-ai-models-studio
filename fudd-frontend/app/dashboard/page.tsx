"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { API_BASE_URL, getHealth } from "@/lib/api";

export default function DashboardPage() {
  const [status, setStatus] = useState<
    { ok: true; value: string } | { ok: false; value: string } | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    getHealth()
      .then((res) => {
        if (cancelled) return;
        setStatus({ ok: true, value: res.status ?? "ok" });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus({
          ok: false,
          value: err instanceof Error ? err.message : "Unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Backend URL: <span className="font-mono">{API_BASE_URL}</span>
        </div>

        <div className="rounded-md border p-3">
          <div className="text-sm font-medium">API Health</div>
          <div className="mt-1 text-sm">
            {status === null ? (
              <span>Checking...</span>
            ) : status.ok ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                OK ({status.value})
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                Error: {status.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

