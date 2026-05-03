import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MagnifierIcon, WalletIcon, ChartIcon } from './Icons';
import { LineChart, TrendingUp, Calculator } from 'lucide-react';
import Image from 'next/image';

interface ServiceProps {
    title: string;
    description: string;
    icon: JSX.Element;
}

const serviceList: ServiceProps[] = [
    {
        title: 'LBO & Private Equity Modeling',
        description:
            'Leveraged buyout analysis with debt schedules, IRR calculations, and multiple on invested capital. Professional-grade PE modeling.',
        icon: <TrendingUp className="w-8 h-8 text-primary" />,
    },
    {
        title: 'Valuation & DCF Analysis',
        description:
            'Reverse DCF, comparable company analysis, and discounted cash flow models for accurate company valuation.',
        icon: <WalletIcon />,
    },
    {
        title: 'Risk & Monte Carlo Simulation',
        description:
            'Probabilistic modeling with thousands of scenarios. View percentile distributions and risk-adjusted returns.',
        icon: <Calculator className="w-8 h-8 text-primary" />,
    },
    {
        title: 'M&A Accretion/Dilution',
        description:
            'Model merger impacts on earnings per share. Pro-forma financial analysis for strategic transactions.',
        icon: <ChartIcon />,
    },
    {
        title: '3-Statement Integration',
        description:
            'Fully linked income statement, balance sheet, and cash flow statements. Circular logic handling.',
        icon: <LineChart className="w-8 h-8 text-primary" />,
    },
    {
        title: 'API-First Architecture',
        description:
            'REST API with JSON inputs and outputs. Auto-generated OpenAPI documentation. Easy integration.',
        icon: <MagnifierIcon />,
    },
];

export const Services = () => {
    return (
        <section id="services" className="container py-24 sm:py-32">
            <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Financial Modeling
                        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                            {' '}
                            Capabilities
                        </span>
                    </h2>

                    <p className="text-muted-foreground text-xl mt-4 mb-8">
                        Eight professional-grade financial models accessible via API or web
                        interface. Built for analysts, founders, and finance teams.
                    </p>

                    <div className="flex flex-col gap-8">
                        {serviceList.map(({ icon, title, description }: ServiceProps) => (
                            <Card key={title}>
                                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                                    <div className="mt-1 bg-primary/10 p-2 rounded-xl">{icon}</div>
                                    <div>
                                        <CardTitle>{title}</CardTitle>
                                        <CardDescription className="text-md mt-2">
                                            {description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-primary mb-4">8</div>
                        <p className="text-xl font-semibold">Financial Models</p>
                        <p className="text-muted-foreground mt-2">One Unified Platform</p>
                        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-primary/10 rounded-lg p-2">LBO</div>
                            <div className="bg-primary/10 rounded-lg p-2">Reverse DCF</div>
                            <div className="bg-primary/10 rounded-lg p-2">Comps</div>
                            <div className="bg-primary/10 rounded-lg p-2">Monte Carlo</div>
                            <div className="bg-primary/10 rounded-lg p-2">M&A</div>
                            <div className="bg-primary/10 rounded-lg p-2">3-Statement</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
