"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiMAndA, MAndAInput, MAndAOutput, CompanyFinancials } from "@/lib/api";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loader";
import { 
  Briefcase, 
  Target,
  Percent,
  Calculator,
  Info,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MAndAPage() {
  const [inputs, setInputs] = useState<MAndAInput>({
    buyer: { net_income: 1000000, shares_outstanding: 500000 },
    target: { net_income: 200000, shares_outstanding: 100000 },
    purchase_price: 3000000,
    cash_percent: 0.50,
    stock_percent: 0.50,
    buyer_stock_price: 50.0,
    synergies: 50000,
    transaction_costs: 25000,
    tax_rate: 0.25
  });

  const [results, setResults] = useState<MAndAOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateModel = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiMAndA(inputs);
      setResults(data);
      toast.success("M&A calculation complete");
    } catch (err: any) {
      toast.error("Failed to calculate M&A model", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [inputs]);

  const updateInput = (key: keyof MAndAInput, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const updateCompany = (side: "buyer" | "target", key: keyof CompanyFinancials, value: number) => {
    setInputs(prev => ({
      ...prev,
      [side]: { ...prev[side], [key]: value }
    }));
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === "ACCRETIVE") return "text-emerald-500 bg-emerald-50 border-emerald-200";
    if (verdict === "DILUTIVE") return "text-red-500 bg-red-50 border-red-200";
    return "text-slate-500 bg-slate-50 border-slate-200";
  };

  return (
    <AppShell title="M&A Accretion / Dilution">
      <FullScreenLoader isLoading={loading} text="Analyzing Deal..." />
      
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-blue-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Buyer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Net Income</label>
                  <Input type="number" value={inputs.buyer.net_income} onChange={(e) => updateCompany("buyer", "net_income", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Shares Out.</label>
                  <Input type="number" value={inputs.buyer.shares_outstanding} onChange={(e) => updateCompany("buyer", "shares_outstanding", Number(e.target.value))} />
                </div>
                <div className="space-y-2 border-t pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase">Stock Price ($)</label>
                  <Input type="number" value={inputs.buyer_stock_price} onChange={(e) => updateInput("buyer_stock_price", Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-purple-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                  <Target className="w-5 h-5 text-purple-600" />
                  Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Net Income</label>
                  <Input type="number" value={inputs.target.net_income} onChange={(e) => updateCompany("target", "net_income", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Shares Out.</label>
                  <Input type="number" value={inputs.target.shares_outstanding} onChange={(e) => updateCompany("target", "shares_outstanding", Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-slate-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="w-5 h-5 text-slate-600" />
                Deal Terms & Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                     Purchase Price
                     <TooltipProvider><Tooltip><TooltipTrigger><Info className="w-3 h-3"/></TooltipTrigger><TooltipContent>Total Enterprise Value paid for the target.</TooltipContent></Tooltip></TooltipProvider>
                   </label>
                   <Input type="number" value={inputs.purchase_price} onChange={(e) => updateInput("purchase_price", Number(e.target.value))} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                     Synergies (Post-Tax)
                     <TooltipProvider><Tooltip><TooltipTrigger><Info className="w-3 h-3"/></TooltipTrigger><TooltipContent>Cost savings or revenue enhancements.</TooltipContent></Tooltip></TooltipProvider>
                   </label>
                   <Input type="number" value={inputs.synergies} onChange={(e) => updateInput("synergies", Number(e.target.value))} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                     % Cash Consideration
                     <TooltipProvider><Tooltip><TooltipTrigger><Info className="w-3 h-3"/></TooltipTrigger><TooltipContent>Portion of deal funded by cash/debt. Remaining {((1 - inputs.cash_percent) * 100).toFixed(0)}% is stock.</TooltipContent></Tooltip></TooltipProvider>
                   </label>
                   <div className="flex items-center gap-4">
                      <Slider value={[inputs.cash_percent * 100]} min={0} max={100} step={5} onValueChange={([v]) => {
                         updateInput("cash_percent", v / 100);
                         updateInput("stock_percent", 1 - (v / 100));
                      }} />
                      <span className="font-bold w-12 text-right">{(inputs.cash_percent * 100).toFixed(0)}%</span>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                     Transaction Costs
                     <TooltipProvider><Tooltip><TooltipTrigger><Info className="w-3 h-3"/></TooltipTrigger><TooltipContent>Advisory, legal, and financing fees.</TooltipContent></Tooltip></TooltipProvider>
                   </label>
                   <Input type="number" value={inputs.transaction_costs} onChange={(e) => updateInput("transaction_costs", Number(e.target.value))} />
                 </div>
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={calculateModel} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg">
             <Calculator className="w-5 h-5 mr-2" /> Calculate EPS Impact
          </Button>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900 text-white shadow-xl border-none overflow-hidden relative group h-full">
             <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
             <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                   <Calculator className="w-4 h-4" />
                   EPS Impact Analysis
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 relative z-10">
                {results ? (
                  <>
                     <div className="flex justify-between items-end border-b border-white/10 pb-6">
                        <div>
                           <p className="text-slate-400 text-sm mb-1">Accretion / Dilution</p>
                           <div className={`text-5xl font-extrabold tracking-tighter ${results.verdict === 'ACCRETIVE' ? 'text-emerald-400' : 'text-red-400'} flex items-center`}>
                              {results.verdict === 'ACCRETIVE' ? <TrendingUp className="mr-2" /> : <TrendingDown className="mr-2" />}
                              {results.accretion_dilution_percent}%
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border ${getVerdictColor(results.verdict)}`}>
                           <span className="font-bold uppercase tracking-widest text-xs">{results.verdict}</span>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                           <span className="text-sm text-slate-300">Buyer Standalone EPS</span>
                           <span className="font-bold">${results.buyer_standalone_eps.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/10 border border-white/20">
                           <span className="text-sm font-medium">Pro-Forma EPS</span>
                           <span className="font-bold text-lg">${results.pro_forma_eps.toFixed(2)}</span>
                        </div>
                     </div>

                     <div className="pt-4">
                         <div className="text-xs text-slate-400 flex justify-between">
                            <span>New Shares Issued: {Math.round(results.pro_forma_shares - inputs.buyer.shares_outstanding).toLocaleString()}</span>
                            <span>Total Shares: {Math.round(results.pro_forma_shares).toLocaleString()}</span>
                         </div>
                     </div>
                     
                     <p className="text-sm leading-relaxed text-slate-300 italic pt-4 border-t border-white/10">
                        {results.explanation}
                     </p>
                  </>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500">
                     <Target className="w-12 h-12 mb-2 opacity-20" />
                     <p>Calculate to see if deal is accretive or dilutive</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
