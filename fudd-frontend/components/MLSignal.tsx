'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiMlSignal, MLSignalOutput } from '@/lib/api';
import { TrendingUp, TrendingDown, BrainCircuit, Activity, Target, ShieldCheck, Gauge } from 'lucide-react';

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
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header Signal */}
            <div className={`p-4 border-b ${signal.signal === 'BUY' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Market Signal</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-black tracking-tight ${signal.signal === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {signal.signal}
                      </p>
                      {signal.signal === 'BUY' ? (
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-rose-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/30 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence Score</p>
                  <p className={`text-xl font-black ${signal.signal === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {signal.confidence}%
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics List (Vertical for better readability in sidebar) */}
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-500">Direction</span>
                  </div>
                  <span className="text-xs font-black text-slate-700">{signal.predicted_direction}</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-500">Model Accuracy</span>
                  </div>
                  <span className="text-xs font-black text-slate-700">{signal.model_accuracy}%</span>
                </div>
              </div>

              {/* Error Metrics Section */}
              {signal.prediction_metrics && (
                <div className="pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prediction Error</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50/50 rounded-md border border-blue-100/50 flex flex-col">
                      <span className="text-[9px] font-bold text-blue-600/70 uppercase">RMSE</span>
                      <span className="text-sm font-black text-blue-700">{signal.prediction_metrics.rmse}</span>
                    </div>
                    <div className="p-2 bg-blue-50/50 rounded-md border border-blue-100/50 flex flex-col">
                      <span className="text-[9px] font-bold text-blue-600/70 uppercase">MAE</span>
                      <span className="text-sm font-black text-blue-700">{signal.prediction_metrics.mae}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Meta */}
              <div className="pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{signal.training_data_points} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>RF v1.2</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
