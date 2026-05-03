import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Check, Infinity, Building, Users } from 'lucide-react';

enum PopularPlanType {
    NO = 0,
    YES = 1,
}

interface PricingProps {
    title: string;
    popular: PopularPlanType;
    price: string;
    description: string;
    buttonText: string;
    benefitList: string[];
    icon: JSX.Element;
}

const pricingList: PricingProps[] = [
    {
        title: 'Self-Hosted',
        popular: 1,
        price: '$0',
        description:
            'Run FUDD on your own infrastructure. Complete control over your data and models.',
        buttonText: 'GitHub →',
        benefitList: [
            'All 8 financial models',
            'Unlimited API calls',
            'Self-hosted (FastAPI + React)',
            'No data retention limits',
            'Commercial use allowed',
            'Community support via GitHub',
        ],
        icon: <Infinity className="w-8 h-8 text-primary" />,
    },
    {
        title: 'Cloud API',
        popular: 0,
        price: 'Free Tier',
        description: 'Hosted version for testing and development. No credit card required.',
        buttonText: 'Get API Key',
        benefitList: [
            'All 8 financial models',
            '1,000 API calls / month',
            '99% uptime SLA',
            'Email support',
            'No deployment required',
            'Rate limited to 10 req/min',
        ],
        icon: <Users className="w-8 h-8 text-primary" />,
    },
    {
        title: 'Enterprise',
        popular: 0,
        price: 'Custom',
        description: 'Dedicated instance with custom model development and SLAs.',
        buttonText: 'Contact Sales',
        benefitList: [
            'Unlimited API calls',
            'Custom model development',
            'SLA guarantees',
            '24/7 phone support',
            'On-premise deployment',
            'SOC2 compliance available',
        ],
        icon: <Building className="w-8 h-8 text-primary" />,
    },
];

export const Pricing = () => {
    return (
        <section id="pricing" className="container py-24 sm:py-32">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
                Choose Your
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    {' '}
                    Deployment Option
                </span>
            </h2>
            <h3 className="text-xl text-center text-muted-foreground pt-4 pb-8">
                Open source core. Free to self-host. Paid cloud options for teams.
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pricingList.map((pricing: PricingProps) => (
                    <Card
                        key={pricing.title}
                        className={
                            pricing.popular === PopularPlanType.YES
                                ? 'drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-primary/30'
                                : ''
                        }
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>{pricing.icon}</div>
                                {pricing.popular === PopularPlanType.YES ? (
                                    <Badge
                                        variant="secondary"
                                        className="text-sm bg-primary/10 text-primary"
                                    >
                                        Recommended
                                    </Badge>
                                ) : null}
                            </div>
                            <CardTitle className="flex item-center justify-between mt-4">
                                {pricing.title}
                            </CardTitle>
                            <div>
                                <span className="text-3xl font-bold">{pricing.price}</span>
                                {pricing.price !== 'Custom' && pricing.title !== 'Self-Hosted' ? (
                                    <span className="text-muted-foreground"> / month</span>
                                ) : null}
                            </div>

                            <CardDescription className="pt-2">
                                {pricing.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Button
                                className="w-full"
                                variant={
                                    pricing.popular === PopularPlanType.YES ? 'default' : 'outline'
                                }
                            >
                                {pricing.buttonText}
                            </Button>
                        </CardContent>

                        <hr className="w-4/5 m-auto mb-4" />

                        <CardFooter className="flex">
                            <div className="space-y-3 w-full">
                                {pricing.benefitList.map((benefit: string) => (
                                    <span key={benefit} className="flex items-start">
                                        <Check className="text-green-500 w-4 h-4 mt-0.5 shrink-0" />
                                        <h3 className="ml-2 text-sm text-muted-foreground">
                                            {benefit}
                                        </h3>
                                    </span>
                                ))}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
};
