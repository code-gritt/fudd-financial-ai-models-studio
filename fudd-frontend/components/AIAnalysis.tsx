'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, TrendingUp, TrendingDown, Info, Gauge, Zap } from 'lucide-react';

interface AnalysisData {
    ticker: string;
    current_price: number;
    price_change_percent: number;
    signal: string;
    analysis: string;
    fundamentals: Record<string, any>;
}

export default function AIAnalysis() {
    const [ticker, setTicker] = useState('AAPL');
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8000/api/v1/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Failed to fetch analysis');
            }
            const data = await res.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Stock Analysis</CardTitle>
                <CardDescription>
                    Deepseek-r1 LLM analyzes fundamentals + price action
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="AAPL"
                    />
                    <Button onClick={fetchAnalysis} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                </div>

                {analysis && (
                    <div className="space-y-4 pt-2">
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className={`p-4 border-b ${analysis.signal === 'BUY' ? 'bg-emerald-50 border-emerald-100' : analysis.signal === 'SELL' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">LLM Signal</p>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-2xl font-black tracking-tight ${analysis.signal === 'BUY' ? 'text-emerald-600' : analysis.signal === 'SELL' ? 'text-rose-600' : 'text-slate-600'}`}>
                                                {analysis.signal}
                                            </p>
                                            <Sparkles className={`h-5 w-5 ${analysis.signal === 'BUY' ? 'text-emerald-500' : analysis.signal === 'SELL' ? 'text-rose-500' : 'text-slate-400'}`} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{analysis.ticker}</p>
                                        <p className="text-xl font-black text-slate-900">${analysis.current_price}</p>
                                        <p className={`text-xs font-bold ${analysis.price_change_percent > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {analysis.price_change_percent > 0 ? '+' : ''}{analysis.price_change_percent}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4 space-y-4 bg-white">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                                        <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Deepseek Insight</h4>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-xs whitespace-pre-wrap leading-relaxed border border-slate-100 text-slate-600 font-medium">
                                        {analysis.analysis}
                                    </div>
                                </div>
                                
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fundamentals</p>
                                    <div className="space-y-1.5">
                                        {Object.entries(analysis.fundamentals).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-xs font-black text-slate-600">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            </CardContent>
        </Card>
    );
}
