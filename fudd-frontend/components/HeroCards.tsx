import { Badge } from './ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { TrendingUp, Percent, BarChart3 } from 'lucide-react';

export const HeroCards = () => {
    return (
        <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
            {/* LBO Model Card */}
            <Card className="absolute w-[320px] -top-[15px] left-[20px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <CardTitle className="text-lg">LBO Model</CardTitle>
                        <CardDescription>Leveraged Buyout Analysis</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        24.5% IRR • 2.8x MoM • 5-year hold
                    </p>
                </CardContent>
            </Card>

            {/* Monte Carlo Card */}
            <Card className="absolute right-[20px] top-4 w-80 drop-shadow-xl shadow-black/10 dark:shadow-white/10">
                <CardHeader className="mt-4 flex justify-center items-center pb-2">
                    <div className="bg-primary/10 p-3 rounded-full -mt-8">
                        <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-center mt-2">Monte Carlo</CardTitle>
                    <CardDescription className="font-normal text-center">
                        Risk Simulation Engine
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-2">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>p10: $74k</span>
                            <span>p50: $87k</span>
                            <span>p90: $103k</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-primary rounded-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            10,000 iterations • Normal distribution
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Reverse DCF Card */}
            <Card className="absolute top-[130px] left-[10px] w-72 drop-shadow-xl shadow-black/10 dark:shadow-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Reverse DCF
                        <Badge variant="secondary" className="text-sm">
                            Implied Growth
                        </Badge>
                    </CardTitle>
                    <div>
                        <span className="text-3xl font-bold">15.6%</span>
                        <span className="text-muted-foreground text-sm"> CAGR</span>
                    </div>
                    <CardDescription className="text-xs">
                        Market-implied growth rate based on current stock price
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm">
                        <span>Current Price: $175</span>
                        <span>FCF/share: $6.50</span>
                    </div>
                </CardContent>
                <hr className="w-4/5 m-auto" />
                <CardFooter className="flex justify-center pt-4">
                    <span className="text-xs text-muted-foreground">
                        If you forecast higher → undervalued
                    </span>
                </CardFooter>
            </Card>

            {/* Comps Valuation Card */}
            <Card className="absolute w-[280px] -right-[10px] bottom-[35px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
                <CardHeader className="space-y-1 flex flex-row justify-start items-start gap-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                        <Percent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-md">Comp Analysis</CardTitle>
                        <CardDescription className="text-sm mt-1">
                            EV/Revenue: 3.2x • P/E: 15.4x
                        </CardDescription>
                        <div className="mt-3 pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                                Valuation range: $500k - $520k
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* API Badge Floating */}
            <Card className="absolute left-[200px] bottom-[80px] w-48 drop-shadow-xl shadow-black/10 dark:shadow-white/10 bg-primary/5 border-primary/20">
                <CardContent className="py-3 text-center">
                    <p className="text-sm font-semibold">REST API</p>
                    <p className="text-xs text-muted-foreground">JSON in/out • Auto-docs</p>
                </CardContent>
            </Card>
        </div>
    );
};
