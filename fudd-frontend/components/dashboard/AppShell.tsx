'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { useState, useEffect } from 'react';
import { FullScreenLoader } from '@/components/ui/loader';

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/lbo', label: 'LBO Model' },
    { href: '/dashboard/monte-carlo', label: 'Monte Carlo' },
    { href: '/dashboard/dcf', label: 'Reverse DCF' },
    { href: '/dashboard/comps', label: 'Comps Analysis' },
    { href: '/dashboard/m-and-a', label: 'M&A Model' },
];

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);

    // Clear loading state when pathname changes
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    const handleNavClick = (href: string) => {
        if (pathname !== href) {
            setIsNavigating(true);
        }
    };

    return (
        <div className="container py-6">
            <FullScreenLoader isLoading={isNavigating} text="Loading Studio..." />
            
            <div className="flex gap-6">
                <aside className="hidden md:block w-56 shrink-0">
                    <div className="rounded-lg border bg-card p-3 shadow-sm">
                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            {siteConfig.name}
                        </div>
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => handleNavClick(item.href)}
                                        className={cn(
                                            'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900',
                                            active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600'
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
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Institutional-grade financial modeling workspace.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm min-h-[600px]">{children}</div>
                </main>
            </div>
        </div>
    );
}
