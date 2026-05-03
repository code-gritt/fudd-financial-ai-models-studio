import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3, GitBranch, LineChart, Sliders } from 'lucide-react';

interface FeatureProps {
    icon: JSX.Element;
    title: string;
    description: string;
}

const features: FeatureProps[] = [
    {
        icon: <BarChart3 className="w-8 h-8" />,
        title: 'Input Assumptions',
        description:
            'Enter your financial assumptions including revenue, growth rates, costs, and debt structures through our clean API or web interface.',
    },
    {
        icon: <GitBranch className="w-8 h-8" />,
        title: 'Select Model Type',
        description:
            'Choose from eight financial models: LBO, Reverse DCF, Comps, Monte Carlo, M&A, 3-Statement, Financial Generator, or All-in-One Studio.',
    },
    {
        icon: <LineChart className="w-8 h-8" />,
        title: 'Run Calculations',
        description:
            'Our backend executes deterministic, auditable calculations using NumPy, SciPy, and custom Python financial engines.',
    },
    {
        icon: <Sliders className="w-8 h-8" />,
        title: 'Analyze Outputs',
        description:
            'Review results including IRRs, valuation ranges, probability distributions, and accretion/dilution impacts with exportable JSON data.',
    },
];

export const HowItWorks = () => {
    return (
        <section id="howItWorks" className="container text-center py-24 sm:py-32">
            <h2 className="text-3xl md:text-4xl font-bold">
                How{' '}
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    FUDD Works
                </span>
            </h2>
            <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
                Four steps from financial assumptions to actionable insights. No spreadsheets
                required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map(({ icon, title, description }: FeatureProps) => (
                    <Card key={title} className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="grid gap-4 place-items-center">
                                <div className="text-primary">{icon}</div>
                                {title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">{description}</CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
};
