"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiLbo, LBOInput, LBOOutput } from "@/lib/api";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Calendar, BarChart4 } from "lucide-react";

export default function LBOPage() {
  const [inputs, setInputs] = useState<LBOInput>({
    ebitda: 100000,
    ebitda_growth_rate: 0.05,
    purchase_ebitda_multiple: 8.0,
    exit_ebitda_multiple: 8.0,
    senior_debt_percent: 0.5,
    senior_interest_rate: 0.08,
    sub_debt_percent: 0.25,
    sub_interest_rate: 0.12,
    holding_period_years: 5,
    initial_equity_percent: 0.25,
  });

  const [results, setResults] = useState<LBOOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateModel = useCallback(async (currentInputs: LBOInput) => {
    setLoading(true);
    try {
      const data = await apiLbo(currentInputs);
      setResults(data);
    } catch (err: any) {
      toast.error("Failed to calculate LBO model", {
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

  const updateInput = (key: keyof LBOInput, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppShell title="LBO Model Dashboard">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Company & Deal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">EBITDA ($)</label>
                  <span className="text-sm font-bold">${inputs.ebitda.toLocaleString()}</span>
                </div>
                <Input 
                  type="number" 
                  value={inputs.ebitda} 
                  onChange={(e) => updateInput("ebitda", Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Purchase Multiple</label>
                  <span className="text-sm font-bold">{inputs.purchase_ebitda_multiple}x</span>
                </div>
                <Slider 
                  value={[inputs.purchase_ebitda_multiple]} 
                  min={4} max={15} step={0.1}
                  onValueChange={([v]) => updateInput("purchase_ebitda_multiple", v)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Exit Multiple</label>
                  <span className="text-sm font-bold">{inputs.exit_ebitda_multiple}x</span>
                </div>
                <Slider 
                  value={[inputs.exit_ebitda_multiple]} 
                  min={4} max={15} step={0.1}
                  onValueChange={([v]) => updateInput("exit_ebitda_multiple", v)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">EBITDA Growth (%)</label>
                  <span className="text-sm font-bold">{(inputs.ebitda_growth_rate * 100).toFixed(1)}%</span>
                </div>
                <Slider 
                  value={[inputs.ebitda_growth_rate * 100]} 
                  min={-20} max={30} step={1}
                  onValueChange={([v]) => updateInput("ebitda_growth_rate", v / 100)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Holding Period</label>
                  <span className="text-sm font-bold">{inputs.holding_period_years} Years</span>
                </div>
                <Slider 
                  value={[inputs.holding_period_years]} 
                  min={3} max={7} step={1}
                  onValueChange={([v]) => updateInput("holding_period_years", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Financing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Senior Debt %</label>
                  <span className="text-sm font-bold">{(inputs.senior_debt_percent * 100).toFixed(0)}%</span>
                </div>
                <Slider 
                  value={[inputs.senior_debt_percent * 100]} 
                  min={0} max={80} step={5}
                  onValueChange={([v]) => updateInput("senior_debt_percent", v / 100)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Initial Equity %</label>
                  <span className="text-sm font-bold">{(inputs.initial_equity_percent * 100).toFixed(0)}%</span>
                </div>
                <Slider 
                  value={[inputs.initial_equity_percent * 100]} 
                  min={10} max={40} step={5}
                  onValueChange={([v]) => updateInput("initial_equity_percent", v / 100)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-blue-600 text-white shadow-lg shadow-blue-600/20 border-none overflow-hidden relative group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Internal Rate of Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold tracking-tighter">
                  {results ? `${results.irr_percent}%` : "---"}
                </div>
                <p className="text-blue-100 text-xs mt-1 font-medium">Annualized investor return</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white shadow-lg border-none overflow-hidden relative group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <BarChart4 className="w-4 h-4" />
                  Multiple of Money
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold tracking-tighter">
                  {results ? `${results.cash_on_cash_return}x` : "---"}
                </div>
                <p className="text-slate-400 text-xs mt-1 font-medium">Cash return multiple</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                Debt Schedule (Yearly)
              </CardTitle>
              <CardDescription>Visualizing senior and sub-debt paydown via cash flow</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Year</TableHead>
                    <TableHead>Beginning Bal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Principal Pay</TableHead>
                    <TableHead className="text-right">Ending Bal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results?.debt_schedule.map((item) => (
                    <TableRow key={item.year}>
                      <TableCell className="font-bold">{item.year}</TableCell>
                      <TableCell>${item.beginning_balance.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">-${item.interest.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">+${item.principal_payment.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">${item.ending_balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {!results && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Adjust parameters to calculate debt paydown
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-none bg-blue-50/30">
            <CardContent className="py-4">
              <p className="text-sm leading-relaxed text-slate-700 italic">
                <span className="font-bold text-slate-900 not-italic mr-1">Scenario Summary:</span>
                {results?.summary || "Waiting for calculation..."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
