"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { siteConfig } from "@/config/site";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/lbo", label: "LBO Model" },
  { href: "/dashboard/monte-carlo", label: "Monte Carlo" },
];

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container py-6">
      <div className="flex gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="rounded-lg border bg-card p-3">
            <div className="px-2 py-1 text-sm font-semibold">
              {siteConfig.name}
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Finance models with a quant-dev UX.
              </p>
            </div>
            <ModeToggle />
          </div>

          <div className="rounded-lg border bg-card p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

