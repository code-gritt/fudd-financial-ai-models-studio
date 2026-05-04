"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiMonteCarlo, MonteCarloInput, MonteCarloOutput } from "@/lib/api";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loader";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { 
  TrendingUp, 
  Zap, 
  Target, 
  AlertCircle, 
  Play,
  ArrowRight,
  BarChart2
} from "lucide-react";

export default function MonteCarloPage() {
  const [inputs, setInputs] = useState<MonteCarloInput>({
    base_revenue: 1000000,
    revenue_growth_mean: 0.10,
    revenue_growth_std: 0.05,
    years: 5,
    simulations: 1000,
    cogs_percentage: 0.40,
    op_ex_percentage: 0.30,
  });

  const [results, setResults] = useState<MonteCarloOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await apiMonteCarlo(inputs);
      setResults(data);
      toast.success("Simulation complete", {
        description: `Successfully processed ${inputs.simulations} scenarios.`,
      });
    } catch (err: any) {
      toast.error("Simulation failed", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInput = (key: keyof MonteCarloInput, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Process data for histogram
  const chartData = useMemo(() => {
    if (!results || !results.all_outcomes.length) return [];
    
    const outcomes = results.all_outcomes;
    const min = Math.min(...outcomes);
    const max = Math.max(...outcomes);
    const binCount = 30;
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      binStart: min + i * binSize,
      binEnd: min + (i + 1) * binSize,
      count: 0,
      label: `$${Math.round((min + i * binSize) / 1000)}k`
    }));

    outcomes.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1);
      bins[binIndex].count++;
    });

    return bins;
  }, [results]);

  return (
    <AppShell title="Monte Carlo Simulation">
      <FullScreenLoader isLoading={loading} text="Running Scenarios..." />
      
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Base Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Base Revenue ($)</label>
                  <span className="text-sm font-bold">${inputs.base_revenue.toLocaleString()}</span>
                </div>
                <Input 
                  type="number" 
                  value={inputs.base_revenue} 
                  onChange={(e) => updateInput("base_revenue", Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Growth Mean (%)</label>
                  <span className="text-sm font-bold">{(inputs.revenue_growth_mean * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[inputs.revenue_growth_mean * 100]} 
                  min={-20} max={50} step={1}
                  onValueChange={([v]) => updateInput("revenue_growth_mean", v / 100)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Growth Volatility (Std Dev)</label>
                  <span className="text-sm font-bold">{(inputs.revenue_growth_std * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[inputs.revenue_growth_std * 100]} 
                  min={1} max={20} step={0.5}
                  onValueChange={([v]) => updateInput("revenue_growth_std", v / 100)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Simulation Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Forecast Years</label>
                  <span className="text-sm font-bold">{inputs.years} Years</span>
                </div>
                <Slider 
                  value={[inputs.years]} 
                  min={1} max={10} step={1}
                  onValueChange={([v]) => updateInput("years", v)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Iterations</label>
                  <span className="text-sm font-bold">{inputs.simulations.toLocaleString()}</span>
                </div>
                <Slider 
                  value={[inputs.simulations]} 
                  min={100} max={5000} step={100}
                  onValueChange={([v]) => updateInput("simulations", v)}
                />
              </div>

              <Button 
                onClick={runSimulation} 
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg group"
                disabled={loading}
              >
                <Play className="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />
                Run Simulation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <MetricCard 
              label="Probability of Profit" 
              value={results ? `${results.probability_positive}%` : "---"} 
              sub="Scenarios with NI > 0"
              icon={<TrendingUp className="w-4 h-4" />}
              color="emerald"
            />
            <MetricCard 
              label="Median Net Income" 
              value={results ? `$${Math.round(results.median_net_income / 1000)}k` : "---"} 
              sub="50th percentile"
              icon={<BarChart2 className="w-4 h-4" />}
              color="blue"
            />
            <MetricCard 
              label="Value at Risk (P10)" 
              value={results ? `$${Math.round(results.p10_net_income / 1000)}k` : "---"} 
              sub="10th percentile (Bad Case)"
              icon={<AlertCircle className="w-4 h-4" />}
              color="red"
            />
          </div>

          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4">
              <div>
                <CardTitle className="text-lg">Distribution of Outcomes</CardTitle>
                <CardDescription>Histogram of projected Year {inputs.years} Net Income</CardDescription>
              </div>
              {results && (
                <div className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border shadow-sm">
                  N = {results.total_simulations}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px] w-full">
                {results ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="label" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#94a3b8' }}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border rounded-xl shadow-xl">
                                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Outcome Range</p>
                                <p className="text-sm font-extrabold text-slate-900">{payload[0].payload.label}</p>
                                <div className="mt-2 pt-2 border-t flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-blue-600" />
                                   <span className="text-xs font-medium text-slate-600">{payload[0].value} Scenarios</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={40}
                      />
                      <ReferenceLine x={Math.floor(chartData.length * 0.1)} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'P10', position: 'top', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                      <ReferenceLine x={Math.floor(chartData.length * 0.5)} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Median', position: 'top', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }} />
                      <ReferenceLine x={Math.floor(chartData.length * 0.9)} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'P90', position: 'top', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 text-slate-400">
                    <BarChart2 className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Run simulation to visualize probability distribution</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
             <Card className="border-none bg-blue-50/30">
                <CardContent className="py-4">
                   <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Expected Mean</h4>
                   <div className="text-xl font-bold text-slate-900">
                      {results ? `$${results.mean_net_income.toLocaleString()}` : "---"}
                   </div>
                </CardContent>
             </Card>
             <Card className="border-none bg-amber-50/30">
                <CardContent className="py-4">
                   <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Range (Worst to Best)</h4>
                   <div className="text-xl font-bold text-slate-900">
                      {results ? `$${Math.round(results.worst_case/1000)}k - $${Math.round(results.best_case/1000)}k` : "---"}
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value, sub, icon, color }: { 
  label: string; 
  value: string; 
  sub: string; 
  icon: React.ReactNode; 
  color: "emerald" | "blue" | "red" 
}) {
  const colors = {
    emerald: "bg-emerald-600 shadow-emerald-600/20 text-emerald-50",
    blue: "bg-blue-600 shadow-blue-600/20 text-blue-50",
    red: "bg-red-600 shadow-red-600/20 text-red-50",
  };

  return (
    <Card className={`${colors[color]} border-none shadow-lg overflow-hidden relative group`}>
      <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-80">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-extrabold tracking-tighter">{value}</div>
        <p className="text-[10px] mt-1 font-medium opacity-70">{sub}</p>
      </CardContent>
    </Card>
  );
}
