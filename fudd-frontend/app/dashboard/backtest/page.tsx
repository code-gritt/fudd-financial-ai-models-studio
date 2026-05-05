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
import { Activity, BarChart3, Play, Download } from 'lucide-react';
import { apiBacktest, BacktestInput, BacktestOutput } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
        } catch (error) {
            console.error('Backtest failed:', error);
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Systematic Backtester
                    </h1>
                    <p className="text-slate-400">
                        Evaluate trading signals using institutional-grade vector engines.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-800 text-slate-300">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                    <Button
                        onClick={handleRun}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        Run Backtest
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Inputs */}
                <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-400" /> Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticker">Ticker</Label>
                            <Input
                                id="ticker"
                                value={inputs.ticker}
                                onChange={(e) => setInputs({ ...inputs, ticker: e.target.value })}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="start">Start Date</Label>
                                <Input
                                    id="start"
                                    type="date"
                                    value={inputs.start_date}
                                    onChange={(e) =>
                                        setInputs({ ...inputs, start_date: e.target.value })
                                    }
                                    className="bg-slate-950 border-slate-800 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">End Date</Label>
                                <Input
                                    id="end"
                                    type="date"
                                    value={inputs.end_date}
                                    onChange={(e) =>
                                        setInputs({ ...inputs, end_date: e.target.value })
                                    }
                                    className="bg-slate-950 border-slate-800 text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>SMA Windows (Short/Long)</Label>
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
                                    className="bg-slate-950 border-slate-800"
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
                                    className="bg-slate-950 border-slate-800"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capital">Initial Capital</Label>
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
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {result ? (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">
                                            Total Return
                                        </CardDescription>
                                        <CardTitle
                                            className={`text-2xl ${
                                                result.performance.total_return_percent >= 0
                                                    ? 'text-emerald-400'
                                                    : 'text-rose-400'
                                            }`}
                                        >
                                            {result.performance.total_return_percent}%
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">
                                            Sharpe Ratio
                                        </CardDescription>
                                        <CardTitle className="text-2xl text-blue-400">
                                            {result.performance.sharpe_ratio}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">
                                            Max Drawdown
                                        </CardDescription>
                                        <CardTitle className="text-2xl text-rose-400">
                                            {result.performance.max_drawdown_percent}%
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs">
                                            Win Rate
                                        </CardDescription>
                                        <CardTitle className="text-2xl text-slate-200">
                                            {result.performance.win_rate}%
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Equity Curve Chart */}
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">Equity Curve</CardTitle>
                                    <CardDescription>
                                        Growth of ${inputs.initial_capital.toLocaleString()} over
                                        time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px]">
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
                                                        stopOpacity={0.3}
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
                                                stroke="#1e293b"
                                                vertical={false}
                                            />
                                            <XAxis dataKey="day" hide />
                                            <YAxis
                                                stroke="#64748b"
                                                fontSize={12}
                                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    border: '1px solid #1e293b',
                                                }}
                                                itemStyle={{ color: '#3b82f6' }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Signals Table */}
                            <Card className="bg-slate-900/50 border-slate-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">Trading Signals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-[200px] overflow-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                                                <tr>
                                                    <th className="px-4 py-2">Date</th>
                                                    <th className="px-4 py-2">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {result.signals.map((sig, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4 py-2">{sig.date}</td>
                                                        <td className="px-4 py-2 font-medium">
                                                            <span
                                                                className={
                                                                    sig.type === 'BUY'
                                                                        ? 'text-emerald-400'
                                                                        : 'text-rose-400'
                                                                }
                                                            >
                                                                {sig.type}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <div className="p-4 bg-blue-500/10 rounded-full">
                                <BarChart3 className="h-10 w-10 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    No Backtest Results
                                </h3>
                                <p className="text-slate-400 max-w-sm mx-auto">
                                    Configure your parameters and run the simulation to see
                                    institutional-grade performance analytics.
                                </p>
                            </div>
                            <Button
                                onClick={handleRun}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? 'Running...' : 'Run Initial Simulation'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
