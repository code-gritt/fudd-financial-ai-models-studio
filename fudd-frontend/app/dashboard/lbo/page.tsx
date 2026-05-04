"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { apiLbo, LBOInput, LBOOutput } from "@/lib/api";
import { toast } from "sonner";
import { FullScreenLoader } from "@/components/ui/loader";
import { Download, Save, FolderOpen, ArrowRightLeft } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import Papa from "papaparse";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

if (typeof window !== "undefined") {
  (pdfMake as any).vfs = (pdfFonts as any)?.pdfMake?.vfs || (pdfFonts as any)?.vfs || (window as any)?.pdfMake?.vfs;
}

const DEFAULT_INPUTS: LBOInput = {
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
};

export default function LBOPage() {
  const [isCompareMode, setIsCompareMode] = useState(false);

  return (
    <AppShell title="LBO Model Dashboard">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
           <h2 className="text-xl font-bold">Leveraged Buyout Simulator</h2>
           <p className="text-sm text-slate-500">Run institutional-grade PE models and analyze returns.</p>
        </div>
        <Button 
          variant={isCompareMode ? "default" : "outline"} 
          onClick={() => setIsCompareMode(!isCompareMode)}
          className="font-bold"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          {isCompareMode ? "Exit Compare Mode" : "Compare Scenarios"}
        </Button>
      </div>

      <div className={`grid gap-8 ${isCompareMode ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        <LBOPanel id="Model A" />
        {isCompareMode && <LBOPanel id="Model B" />}
      </div>
    </AppShell>
  );
}

function LBOPanel({ id }: { id: string }) {
  const [inputs, setInputs] = useState<LBOInput>(DEFAULT_INPUTS);
  const [results, setResults] = useState<LBOOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateModel = useCallback(async (currentInputs: LBOInput) => {
    setLoading(true);
    try {
      const data = await apiLbo(currentInputs);
      setResults(data);
    } catch (err: any) {
      toast.error(`Failed to calculate ${id}`, { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateModel(inputs);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputs, calculateModel]);

  const updateInput = (key: keyof LBOInput, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const saveScenario = () => {
    localStorage.setItem(`fudd_lbo_scenario_${id}`, JSON.stringify(inputs));
    toast.success(`Scenario Saved (${id})`, { description: "You can load this later." });
  };

  const loadScenario = () => {
    const saved = localStorage.getItem(`fudd_lbo_scenario_${id}`);
    if (saved) {
      setInputs(JSON.parse(saved));
      toast.success(`Scenario Loaded (${id})`);
    } else {
      toast.error("No saved scenario found.");
    }
  };

  const exportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lbo_results_${id}.json`;
    a.click();
  };

  const exportCSV = () => {
    if (!results) return;
    const csv = Papa.unparse(results.debt_schedule);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lbo_debt_schedule_${id}.csv`;
    a.click();
  };

  const exportPDF = () => {
    if (!results) return;
    const docDefinition: any = {
      content: [
        { text: `FUDD Finance - LBO Report (${id})`, style: 'header' },
        { text: `Scenario Summary`, style: 'subheader' },
        { text: results.summary, margin: [0, 0, 0, 20] },
        {
          columns: [
             { text: `Purchase Price: $${results.purchase_price.toLocaleString()}` },
             { text: `Total Debt: $${results.total_debt.toLocaleString()}` },
             { text: `Initial Equity: $${results.initial_equity.toLocaleString()}` },
          ],
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
             { text: `IRR: ${results.irr_percent}%`, style: 'highlight' },
             { text: `MoM: ${results.cash_on_cash_return}x`, style: 'highlight' },
          ],
          margin: [0, 0, 0, 20]
        },
        { text: 'Debt Schedule', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['Year', 'Beginning Balance', 'Interest', 'Principal Payment', 'Ending Balance'],
              ...results.debt_schedule.map(item => [
                item.year, 
                `$${item.beginning_balance.toLocaleString()}`, 
                `$${item.interest.toLocaleString()}`, 
                `$${item.principal_payment.toLocaleString()}`, 
                `$${item.ending_balance.toLocaleString()}`
              ])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
        highlight: { fontSize: 14, bold: true, color: 'blue' }
      }
    };
    pdfMake.createPdf(docDefinition).download(`lbo_report_${id}.pdf`);
  };

  return (
    <div className="space-y-6 relative border border-slate-100 p-4 rounded-xl bg-slate-50/20">
      <FullScreenLoader isLoading={loading} text={`Calculating ${id}...`} />
      
      <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
        <h3 className="font-bold text-slate-800 ml-2">{id}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={saveScenario} title="Save Scenario"><Save className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" onClick={loadScenario} title="Load Scenario"><FolderOpen className="w-4 h-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportPDF}>Export to PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV}>Export to CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportJSON}>Export to JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm">Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>EBITDA ($)</span>
                  <span>${inputs.ebitda.toLocaleString()}</span>
                </div>
                <Input type="number" value={inputs.ebitda} onChange={(e) => updateInput("ebitda", Number(e.target.value))} className="h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Purchase Multiple</span>
                  <span>{inputs.purchase_ebitda_multiple}x</span>
                </div>
                <Slider value={[inputs.purchase_ebitda_multiple]} min={4} max={15} step={0.1} onValueChange={([v]) => updateInput("purchase_ebitda_multiple", v)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Exit Multiple</span>
                  <span>{inputs.exit_ebitda_multiple}x</span>
                </div>
                <Slider value={[inputs.exit_ebitda_multiple]} min={4} max={15} step={0.1} onValueChange={([v]) => updateInput("exit_ebitda_multiple", v)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Senior Debt %</span>
                  <span>{(inputs.senior_debt_percent * 100).toFixed(0)}%</span>
                </div>
                <Slider value={[inputs.senior_debt_percent * 100]} min={0} max={80} step={5} onValueChange={([v]) => updateInput("senior_debt_percent", v / 100)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
           <Card className="bg-blue-600 text-white shadow-lg border-none overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <CardContent className="p-4">
                 <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mb-1">IRR</p>
                 <div className="text-3xl font-extrabold">{results ? `${results.irr_percent}%` : "---"}</div>
              </CardContent>
           </Card>
           <Card className="bg-slate-900 text-white shadow-lg border-none overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              <CardContent className="p-4">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">MoM</p>
                 <div className="text-3xl font-extrabold">{results ? `${results.cash_on_cash_return}x` : "---"}</div>
              </CardContent>
           </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">Debt Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Beg Bal</TableHead>
                <TableHead>Int</TableHead>
                <TableHead>Prin Pay</TableHead>
                <TableHead>End Bal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results?.debt_schedule.map((item) => (
                <TableRow key={item.year}>
                  <TableCell className="font-bold">{item.year}</TableCell>
                  <TableCell>${item.beginning_balance.toLocaleString()}</TableCell>
                  <TableCell className="text-red-500">-${item.interest.toLocaleString()}</TableCell>
                  <TableCell className="text-green-500">+${item.principal_payment.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">${item.ending_balance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
