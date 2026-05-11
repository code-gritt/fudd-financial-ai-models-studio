'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AnalysisData {
    ticker: string;
    current_price: number;
    price_change_percent: number;
    signal: string;
    analysis: string;
    fundamentals: Record<string, any>;
    simulated?: boolean;
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
            const res = await fetch('https://fudd-backend.onrender.com/api/v1/ai/analyze', {
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
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">{analysis.ticker}</span>
                            <span className="font-semibold">${analysis.current_price}</span>
                            <span
                                className={
                                    analysis.price_change_percent > 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {analysis.price_change_percent > 0 ? '+' : ''}
                                {analysis.price_change_percent}%
                            </span>
                            {analysis.simulated && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                    Simulated
                                </span>
                            )}
                            <span
                                className={`px-2 py-1 rounded text-sm font-bold ${
                                    analysis.signal === 'BUY'
                                        ? 'bg-green-100 text-green-700'
                                        : analysis.signal === 'SELL'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {analysis.signal}
                            </span>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border">
                            {analysis.analysis}
                        </div>
                    </div>
                )}

                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            </CardContent>
        </Card>
    );
}
