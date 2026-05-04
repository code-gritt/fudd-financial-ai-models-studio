"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiComps, CompsOutput, CompanyMetrics } from "@/lib/api";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loader";
import { 
  Building2, 
  Calculator,
  Plus,
  Trash2,
  TrendingUp,
  LineChart
} from "lucide-react";

export default function CompsPage() {
  const [target, setTarget] = useState<CompanyMetrics>({ revenue: 50000, ebitda: 10000, net_income: 5000 });
  const [comps, setComps] = useState<CompanyMetrics[]>([
    { revenue: 100000, ebitda: 25000, net_income: 12000 },
    { revenue: 200000, ebitda: 45000, net_income: 20000 },
  ]);

  const [results, setResults] = useState<CompsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateModel = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiComps({ target_company: target, comparable_companies: comps });
      setResults(data);
      toast.success("Valuation complete");
    } catch (err: any) {
      toast.error("Failed to calculate Comps", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [target, comps]);

  const updateTarget = (key: keyof CompanyMetrics, value: number) => {
    setTarget(prev => ({ ...prev, [key]: value }));
  };

  const updateComp = (index: number, key: keyof CompanyMetrics, value: number) => {
    const newComps = [...comps];
    newComps[index] = { ...newComps[index], [key]: value };
    setComps(newComps);
  };

  const addComp = () => {
    setComps([...comps, { revenue: 0, ebitda: 0, net_income: 0 }]);
  };

  const removeComp = (index: number) => {
    if (comps.length <= 1) {
      toast.error("Must have at least one comparable company");
      return;
    }
    const newComps = [...comps];
    newComps.splice(index, 1);
    setComps(newComps);
  };

  return (
    <AppShell title="Comparable Company Analysis">
      <FullScreenLoader isLoading={loading} text="Analyzing Multiples..." />
      
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardHeader className="pb-4 border-b border-blue-100">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <TargetIcon className="w-5 h-5 text-blue-600" />
                Target Company
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Revenue</label>
                  <Input type="number" value={target.revenue} onChange={(e) => updateTarget("revenue", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">EBITDA</label>
                  <Input type="number" value={target.ebitda} onChange={(e) => updateTarget("ebitda", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Net Income</label>
                  <Input type="number" value={target.net_income} onChange={(e) => updateTarget("net_income", Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
             <h3 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Comparable Public Companies
             </h3>
             <Button variant="outline" size="sm" onClick={addComp}>
                <Plus className="w-4 h-4 mr-2" /> Add Comp
             </Button>
          </div>

          <div className="space-y-4">
            {comps.map((comp, index) => (
              <Card key={index} className="border-none shadow-sm bg-slate-50 relative group">
                <div className="absolute right-[-10px] top-[-10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => removeComp(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Revenue</label>
                      <Input type="number" value={comp.revenue} onChange={(e) => updateComp(index, "revenue", Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">EBITDA</label>
                      <Input type="number" value={comp.ebitda} onChange={(e) => updateComp(index, "ebitda", Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Net Income</label>
                      <Input type="number" value={comp.net_income} onChange={(e) => updateComp(index, "net_income", Number(e.target.value))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button onClick={calculateModel} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg">
             <Calculator className="w-5 h-5 mr-2" /> Calculate Valuation
          </Button>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900 text-white shadow-xl border-none overflow-hidden relative group h-full min-h-[400px]">
             <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
             <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" />
                   Implied Valuation Range
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {results ? (
                  <>
                     <div>
                        <div className="text-4xl font-extrabold tracking-tighter text-white">
                           ${results.implied_valuation_range.low.toLocaleString()}
                           <span className="text-slate-500 text-2xl mx-2">to</span>
                           ${results.implied_valuation_range.high.toLocaleString()}
                        </div>
                     </div>
                     
                     <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                        <h4 className="font-bold text-sm text-slate-300 border-b border-white/10 pb-2">Average Multiples Used</h4>
                        <div className="flex justify-between items-center">
                           <span className="text-sm text-slate-400">EV / Revenue</span>
                           <span className="font-bold">{results.multiples_used.ev_revenue}x</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm text-slate-400">P / E Ratio</span>
                           <span className="font-bold">{results.multiples_used.pe_ratio}x</span>
                        </div>
                     </div>
                     
                     <p className="text-sm leading-relaxed text-slate-300 italic">
                        {results.explanation}
                     </p>
                  </>
                ) : (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-500">
                     <LineChart className="w-12 h-12 mb-2 opacity-20" />
                     <p>Add comps and calculate to see valuation</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function TargetIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
