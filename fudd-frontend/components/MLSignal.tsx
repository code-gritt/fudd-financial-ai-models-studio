'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiMlSignal, MLSignalOutput } from '@/lib/api';

export default function MLSignal() {
  const [ticker, setTicker] = useState('AAPL');
  const [signal, setSignal] = useState<MLSignalOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignal = async () => {
    setLoading(true);
    setError(null);
    setSignal(null);

    try {
      const data = await apiMlSignal({ ticker, lookback_days: 500 });
      setSignal(data);
    } catch (err: any) {
      console.error('ML signal error:', err);
      setError(err.message || 'Unable to fetch ML signal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-slate-100/50 rounded-t-xl">
        <CardTitle className="text-sm font-bold">ML Trading Signal</CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Generate a buy/sell signal from the Random Forest model.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="ml-ticker">
            Ticker
          </label>
          <Input
            id="ml-ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="h-9 border-slate-200"
            placeholder="AAPL"
          />
        </div>

        <Button
          onClick={fetchSignal}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
        >
          {loading ? 'Loading...' : 'Get Signal'}
        </Button>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {signal ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p className="text-sm text-slate-500">Signal</p>
            <p className={`text-2xl font-extrabold ${signal.signal === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {signal.signal}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <p className="text-slate-400">Confidence</p>
                <p className="font-bold">{signal.confidence}%</p>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <p className="text-slate-400">Prediction</p>
                <p className="font-bold">{signal.predicted_direction}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <p>Training points: {signal.training_data_points}</p>
              <p>Accuracy: {signal.model_accuracy}%</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
