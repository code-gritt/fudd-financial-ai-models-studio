'use client';

import { useState, useEffect } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { Activity, BarChart3, Play, Download, Loader2, TrendingUp, ShieldAlert, Target } from 'lucide-react';
import { apiBacktest, BacktestInput, BacktestOutput } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AppShell } from '@/components/dashboard/AppShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function BacktestPage() {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [result, setResult] = useState<BacktestOutput | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [inputs, setInputs] = useState<BacktestInput>({
        ticker: 'SPY',
        start_date: '2023-01-01',
        end_date: '2024-01-01',
        short_window: 20,
        long_window: 50,
        initial_capital: 10000,
    });

    const handleRun = async () => {
        setLoading(true);
        try {
            const data = await apiBacktest(inputs);
            setResult(data);
            toast.success('Simulation Complete', {
                description: `Backtest for ${inputs.ticker} executed successfully.`
            });
        } catch (error: any) {
            console.error('Backtest failed:', error);
            toast.error('Simulation Failed', {
                description: error.message || 'An unexpected error occurred.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    const chartData =
        result?.equity_curve.map((value, index) => ({
            day: index,
            value: typeof value === 'number' ? value : 0,
        })) || [];

    return (
        <AppShell title="Systematic Backtester">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold">Quantitative Strategy Engine</h2>
                    <p className="text-sm text-slate-500">Evaluate trading signals using institutional-grade vector engines.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="font-bold border-slate-200">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                    <Button
                        onClick={handleRun}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 font-bold"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        Run Simulation
                    </Button>
                </div>
            </div>

            <div className="space-y-8 relative border border-slate-100 p-6 rounded-xl bg-slate-50/20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Inputs */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="py-3 px-4 border-b bg-slate-100/50 rounded-t-xl">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-600" /> Strategy Parameters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ticker" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticker Symbol</Label>
                                    <Input
                                        id="ticker"
                                        value={inputs.ticker}
                                        onChange={(e) => setInputs({ ...inputs, ticker: e.target.value })}
                                        className="h-9 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="start" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</Label>
                                        <Input
                                            id="start"
                                            type="date"
                                            value={inputs.start_date}
                                            onChange={(e) =>
                                                setInputs({ ...inputs, start_date: e.target.value })
                                            }
                                            className="h-9 border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end" className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</Label>
                                        <Input
                                            id="end"
                                            type="date"
                                            value={inputs.end_date}
                                            onChange={(e) =>
                                                setInputs({ ...inputs, end_date: e.target.value })
                                            }
                                            className="h-9 border-slate-200 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMA Windows (S / L)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={inputs.short_window}
                                            onChange={(e) =>
                                                setInputs({
                                                    ...inputs,
                                                    short_window: Number(e.target.value),
                                                })
                                            }
                                            className="h-9 border-slate-200"
                                        />
                                        <Input
                                            type="number"
                                            value={inputs.long_window}
                                            onChange={(e) =>
                                                setInputs({
                                                    ...inputs,
                                                    long_window: Number(e.target.value),
                                                })
                                            }
                                            className="h-9 border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capital" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Capital ($)</Label>
                                    <Input
                                        id="capital"
                                        type="number"
                                        value={inputs.initial_capital}
                                        onChange={(e) =>
                                            setInputs({
                                                ...inputs,
                                                initial_capital: Number(e.target.value),
                                            })
                                        }
                                        className="h-9 border-slate-200"
                                    />
                                </div>
                                <Button
                                    onClick={handleRun}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                    )}
                                    Update Model
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {result ? (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-blue-600 text-white shadow-lg border-none overflow-hidden relative">
                                        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                                        <CardContent className="p-4">
                                            <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mb-1">Total Return</p>
                                            <div className="text-2xl font-extrabold">
                                                {result.performance.total_return_percent >= 0 ? '+' : ''}
                                                {result.performance.total_return_percent}%
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-slate-900 text-white shadow-lg border-none overflow-hidden relative">
                                        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                                        <CardContent className="p-4">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Sharpe Ratio</p>
                                            <div className="text-2xl font-extrabold">{result.performance.sharpe_ratio}</div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden relative">
                                        <CardContent className="p-4">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <ShieldAlert className="h-3 w-3 text-rose-500" /> Max Drawdown
                                            </p>
                                            <div className="text-2xl font-extrabold text-rose-600">
                                                {result.performance.max_drawdown_percent}%
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border border-slate-100 shadow-sm overflow-hidden relative">
                                        <CardContent className="p-4">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <Target className="h-3 w-3 text-emerald-500" /> Win Rate
                                            </p>
                                            <div className="text-2xl font-extrabold text-slate-900">
                                                {result.performance.win_rate}%
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Equity Curve Chart */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-bold">Equity Curve</CardTitle>
                                            <CardDescription className="text-xs">
                                                Growth of ${inputs.initial_capital.toLocaleString()} over simulation period
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-[400px] p-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient
                                                        id="colorValue"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#3b82f6"
                                                            stopOpacity={0.15}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#3b82f6"
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="#f1f5f9"
                                                    vertical={false}
                                                />
                                                <XAxis dataKey="day" hide />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={11}
                                                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                                                    domain={['auto', 'auto']}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    }}
                                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                                    labelStyle={{ display: 'none' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorValue)"
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Signals Table */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="py-3 px-4 border-b">
                                        <CardTitle className="text-sm font-bold">Trading Signals</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="max-h-[300px] overflow-auto">
                                            <Table>
                                                <TableHeader className="bg-slate-50/50">
                                                    <TableRow>
                                                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Execution Date</TableHead>
                                                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Signal Type</TableHead>
                                                        <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {result.signals.map((sig, i) => (
                                                        <TableRow key={i} className="hover:bg-slate-50/50">
                                                            <TableCell className="font-medium text-slate-600">{sig.date}</TableCell>
                                                            <TableCell>
                                                                <span
                                                                    className={`px-2 py-1 rounded text-[10px] font-extrabold ${
                                                                        sig.type === 'BUY'
                                                                            ? 'bg-emerald-100 text-emerald-700'
                                                                            : 'bg-rose-100 text-rose-700'
                                                                    }`}
                                                                >
                                                                    {sig.type}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50">View Details</Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm">
                                <div className="p-6 bg-blue-50 rounded-full">
                                    <BarChart3 className="h-12 w-12 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        No Simulation Data
                                    </h3>
                                    <p className="text-slate-500 max-w-sm mx-auto text-sm">
                                        Configure strategy parameters on the left and run the institutional-grade vector engine to analyze performance.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleRun}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 px-8"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Initializing Engine...
                                        </>
                                    ) : 'Run Initial Simulation'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
