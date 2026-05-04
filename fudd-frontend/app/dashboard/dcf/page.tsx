"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { apiReverseDCF, ReverseDCFInput, ReverseDCFOutput } from "@/lib/api";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loader";
import { 
  Search, 
  Activity,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReverseDCFPage() {
  const [inputs, setInputs] = useState<ReverseDCFInput>({
    current_stock_price: 150.0,
    free_cash_flow_per_share: 5.0,
    discount_rate: 0.10,
    years: 5,
    terminal_growth_estimate: 0.03,
  });

  const [results, setResults] = useState<ReverseDCFOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateModel = useCallback(async (currentInputs: ReverseDCFInput) => {
    setLoading(true);
    try {
      const data = await apiReverseDCF(currentInputs);
      setResults(data);
    } catch (err: any) {
      toast.error("Failed to calculate Reverse DCF model", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateModel(inputs);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [inputs, calculateModel]);

  const updateInput = (key: keyof ReverseDCFInput, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes("PESSIMISTIC")) return "text-red-500 bg-red-50 border-red-200";
    if (verdict.includes("MODERATE")) return "text-amber-500 bg-amber-50 border-amber-200";
    if (verdict.includes("OPTIMISTIC")) return "text-emerald-500 bg-emerald-50 border-emerald-200";
    return "text-purple-500 bg-purple-50 border-purple-200"; // EUPHORIC
  };

  return (
    <AppShell title="Reverse DCF Calculator">
      <FullScreenLoader isLoading={loading} text="Calculating Implied Growth..." />
      
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Market Inputs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Current Stock Price ($)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>The current market price of one share.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <span className="text-sm font-bold">${inputs.current_stock_price.toLocaleString()}</span>
                </div>
                <Input 
                  type="number" 
                  value={inputs.current_stock_price} 
                  onChange={(e) => updateInput("current_stock_price", Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    FCF per Share ($)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Free Cash Flow generated per share over the trailing 12 months.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <span className="text-sm font-bold">${inputs.free_cash_flow_per_share.toLocaleString()}</span>
                </div>
                <Input 
                  type="number" 
                  value={inputs.free_cash_flow_per_share} 
                  onChange={(e) => updateInput("free_cash_flow_per_share", Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Discount Rate (%)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Your required rate of return (WACC).</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <span className="text-sm font-bold">{(inputs.discount_rate * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[inputs.discount_rate * 100]} 
                  min={5} max={20} step={0.5}
                  onValueChange={([v]) => updateInput("discount_rate", v / 100)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Terminal Growth (%)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Perpetual growth rate after the forecast period (usually 2-3%).</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <span className="text-sm font-bold">{(inputs.terminal_growth_estimate * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[inputs.terminal_growth_estimate * 100]} 
                  min={0} max={5} step={0.1}
                  onValueChange={([v]) => updateInput("terminal_growth_estimate", v / 100)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900 text-white shadow-lg border-none overflow-hidden relative group h-full">
             <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />
             <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                   <Activity className="w-4 h-4" />
                   Implied Growth Rate
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div>
                   <div className="text-5xl font-extrabold tracking-tighter text-white">
                      {results ? `${results.implied_growth_rate}%` : "---"}
                   </div>
                   <p className="text-slate-400 text-sm mt-2 font-medium">
                      The market expects FCF to grow at this rate annually for the next {inputs.years} years.
                   </p>
                </div>
                
                {results && (
                   <div className={`mt-8 p-4 rounded-xl border ${getVerdictColor(results.verdict)}`}>
                      <h4 className="font-bold text-sm mb-1">Market Sentiment Verdict:</h4>
                      <p className="text-lg font-bold">{results.verdict}</p>
                   </div>
                )}
                
                {results && (
                   <div className="bg-white/5 border border-white/10 p-4 rounded-xl mt-4">
                      <p className="text-sm leading-relaxed text-slate-300">
                         {results.explanation}
                      </p>
                   </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
