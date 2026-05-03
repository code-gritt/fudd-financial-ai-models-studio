import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, TrendingUp, Calculator, BarChart, GitMerge, Activity } from 'lucide-react';

interface FeatureProps {
    title: string;
    description: string;
    icon: JSX.Element;
}

const features: FeatureProps[] = [
    {
        title: 'LBO Modeling',
        description:
            'Leveraged buyout analysis with debt schedules, IRR calculations, and multiple on invested capital (MoM) returns.',
        icon: <TrendingUp className="w-12 h-12 text-primary" />,
    },
    {
        title: 'Reverse DCF',
        description:
            'Calculate implied market growth rates from current stock prices. Identify undervalued and overvalued securities.',
        icon: <Percent className="w-12 h-12 text-primary" />,
    },
    {
        title: 'Monte Carlo Simulation',
        description:
            'Run thousands of scenarios with probabilistic inputs. View percentile distributions and risk metrics.',
        icon: <Activity className="w-12 h-12 text-primary" />,
    },
    {
        title: 'Comparable Company Analysis',
        description:
            'Value companies using multiples from peer groups. EV/Revenue, EV/EBITDA, and P/E ratios.',
        icon: <BarChart className="w-12 h-12 text-primary" />,
    },
    {
        title: 'M&A Accretion/Dilution',
        description:
            'Model merger impacts on earnings per share. Calculate pro-forma financials and deal effects.',
        icon: <GitMerge className="w-12 h-12 text-primary" />,
    },
    {
        title: 'Financial Statement Generation',
        description:
            'Generate P&L, balance sheet, and cash flow statements from basic operating assumptions.',
        icon: <Calculator className="w-12 h-12 text-primary" />,
    },
];

const featureList: string[] = [
    'LBO Model',
    'Reverse DCF',
    'Monte Carlo',
    'Comparable Comps',
    'M&A Analysis',
    '3-Statement',
    'REST API',
    'JSON Export',
    'Pydantic Validation',
    'FastAPI Backend',
];

export const Features = () => {
    return (
        <section id="features" className="container py-24 sm:py-32 space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
                Financial{' '}
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    Modeling Capabilities
                </span>
            </h2>

            <div className="flex flex-wrap md:justify-center gap-4">
                {featureList.map((feature: string) => (
                    <div key={feature}>
                        <Badge variant="secondary" className="text-sm">
                            {feature}
                        </Badge>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map(({ title, description, icon }: FeatureProps) => (
                    <Card key={title} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-center mb-4">{icon}</div>
                            <CardTitle className="text-center">{title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-center">
                            {description}
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Badge variant="outline">Available Now</Badge>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
};
