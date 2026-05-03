import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

interface FAQProps {
    question: string;
    answer: string;
    value: string;
}

const FAQList: FAQProps[] = [
    {
        question: 'What financial models does FUDD support?',
        answer: 'FUDD supports eight financial models: LBO (Leveraged Buyout), Reverse DCF, Comparable Company Analysis, 3-Statement Model, M&A Accretion/Dilution, Monte Carlo Simulation, Financial Model Generator, and the All-in-One Studio that combines all models.',
        value: 'item-1',
    },
    {
        question: 'Is FUDD free to use?',
        answer: 'The core platform is open source and completely free to self-host. We also offer a free cloud tier with 1,000 API calls per month for testing and development. Enterprise plans with dedicated support and custom models are available for production workloads.',
        value: 'item-2',
    },
    {
        question: 'How accurate are the financial calculations?',
        answer: 'All calculations are deterministic and use industry-standard formulas. LBO uses debt schedule waterfalls, DCF uses proper discounting with terminal values, Monte Carlo uses Gaussian distributions with configurable parameters. Every model is tested against Excel outputs for validation.',
        value: 'item-3',
    },
    {
        question: 'Can I integrate FUDD into my existing application?',
        answer: 'Yes. FUDD provides a REST API with JSON inputs and outputs. The backend is built with FastAPI, making it easy to integrate with any frontend or service. Auto-generated OpenAPI documentation is available at /docs endpoint.',
        value: 'item-4',
    },
    {
        question: 'Do I need a finance background to use FUDD?',
        answer: 'No. While understanding financial concepts helps, FUDD is designed to be accessible. Each model accepts clear, documented inputs and returns structured outputs with explanatory summaries. The API can be used by developers building finance applications without being finance experts themselves.',
        value: 'item-5',
    },
    {
        question: "What's the difference between FUDD and Excel?",
        answer: 'FUDD provides auditable, reproducible, and version-controllable financial models through an API. Unlike Excel, there are no circular reference errors, broken links, or manual copy-paste mistakes. All calculations are deterministic and can be integrated into automated workflows.',
        value: 'item-6',
    },
    {
        question: 'How do I deploy FUDD myself?',
        answer: 'Clone the GitHub repository, install dependencies with pip/uv, set environment variables, and run the FastAPI server with uvicorn. The frontend is built with Next.js and can be deployed to Vercel, Netlify, or any Node.js hosting platform. Full instructions are in the README.',
        value: 'item-7',
    },
];

export const FAQ = () => {
    return (
        <section id="faq" className="container py-24 sm:py-32">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked{' '}
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                    Questions
                </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
                Everything you need to know about FUDD financial modeling platform.
            </p>

            <Accordion type="single" collapsible className="w-full AccordionRoot">
                {FAQList.map(({ question, answer, value }: FAQProps) => (
                    <AccordionItem key={value} value={value}>
                        <AccordionTrigger className="text-left font-medium">
                            {question}
                        </AccordionTrigger>

                        <AccordionContent className="text-muted-foreground">
                            {answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <h3 className="font-medium mt-8">
                Still have questions?{' '}
                <Link
                    href="mailto:contact@fudd.dev"
                    className="text-primary transition-all border-primary hover:border-b-2"
                >
                    Contact our team
                </Link>
            </h3>
        </section>
    );
};
