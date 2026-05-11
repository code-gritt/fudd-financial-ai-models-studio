"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { getHealth } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  BarChart4, 
  Layers, 
  ArrowRight, 
  Clock, 
  Zap,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import AIAnalysis from "@/components/AIAnalysis";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<{ ok: boolean; value: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getHealth()
      .then((res) => setStatus({ ok: true, value: res.status ?? "online" }))
      .catch(() => setStatus({ ok: false, value: "offline" }));
  }, []);

  if (!mounted) return null;

  return (
    <AppShell title="Studio Overview">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || "Financial Analyst"}
            </h2>
            <p className="text-slate-400 mt-2 max-w-md">
              Your financial modeling studio is ready. Run simulations, project returns, and analyze deals with institutional-grade precision.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 font-bold">
                <Link href="/dashboard/lbo">
                  Launch LBO Model <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="w-4 h-4" />
                <span>Last active: Just now</span>
              </div>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute right-[-5%] top-[-20%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute right-[10%] bottom-[-30%] w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
          
          <div className="hidden lg:flex items-center justify-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
             <div className="grid grid-cols-2 gap-4 text-center">
                <div className="px-4 py-2">
                   <div className="text-2xl font-bold">14</div>
                   <div className="text-[10px] uppercase tracking-wider text-slate-400">Saved Scenarios</div>
                </div>
                <div className="px-4 py-2 border-l border-white/10">
                   <div className="text-2xl font-bold">1.2k</div>
                   <div className="text-[10px] uppercase tracking-wider text-slate-400">Simulations Run</div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Encrypted</div>
              <p className="text-xs text-slate-400 mt-1">AES-256 Protocol active</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                API Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12ms</div>
              <p className="text-xs text-slate-400 mt-1">Global edge optimized</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Backend Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status?.ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-2xl font-bold uppercase">{status?.ok ? "ONLINE" : (status?.value || "Connecting...")}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Endpoint: api.fudd.finance</p>
            </CardContent>
          </Card>
        </div>

        {/* Model Launchpad */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
             <BarChart4 className="w-5 h-5" />
             Model Launchpad
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModelCard 
              title="LBO Model" 
              desc="Full leveraged buyout simulation with senior/sub debt schedule and returns analysis."
              icon={<TrendingUp className="w-6 h-6" />}
              href="/dashboard/lbo"
              color="blue"
            />
            <ModelCard 
              title="Monte Carlo" 
              desc="Probabilistic forecasting using thousands of random scenarios to quantify risk."
              icon={<BarChart4 className="w-6 h-6" />}
              href="/dashboard/monte-carlo"
              color="purple"
            />
            <ModelCard 
              title="Reverse DCF" 
              desc="Calculate implied market growth rates based on current stock price and FCF."
              icon={<TrendingUp className="w-6 h-6" />}
              href="/dashboard/dcf"
              color="emerald"
            />
            <ModelCard 
              title="Comps Analysis" 
              desc="Derive valuation ranges based on public market peer multiples (EV/Rev, P/E)."
              icon={<Layers className="w-6 h-6" />}
              href="/dashboard/comps"
              color="amber"
            />
            <ModelCard 
              title="M&A Analysis" 
              desc="Accretion/Dilution analysis for corporate mergers and strategic acquisitions."
              icon={<BarChart4 className="w-6 h-6" />}
              href="/dashboard/m-and-a"
              color="slate"
            />
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                AI Market Insights
             </h3>
             <AIAnalysis />
          </div>
          
          <div className="space-y-4">
             <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recent Activity
             </h3>
             <Card>
                <CardContent className="p-0">
                   <div className="divide-y">
                      {[1, 2, 3].map((i) => (
                         <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                               {i === 1 ? 'AAPL' : i === 2 ? 'TSLA' : 'MSFT'}
                            </div>
                            <div>
                               <div className="text-sm font-bold">AI Analysis Run</div>
                               <div className="text-xs text-slate-400">2 hours ago</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ModelCard({ title, desc, icon, href, disabled, color }: { 
  title: string; 
  desc: string; 
  icon: React.ReactNode; 
  href: string;
  disabled?: boolean;
  color: string;
}) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <Card className={`group transition-all duration-300 hover:shadow-md ${disabled ? 'opacity-70 grayscale cursor-not-allowed' : ''}`}>
      <CardHeader>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          asChild 
          variant={disabled ? "secondary" : "outline"} 
          className="w-full font-bold group"
          disabled={disabled}
        >
          {disabled ? (
            <span>Coming Soon</span>
          ) : (
            <Link href={href}>
              Open Model <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
