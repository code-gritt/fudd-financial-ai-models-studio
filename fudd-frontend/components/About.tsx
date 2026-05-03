import { Statistics } from './Statistics';
import { LineChart } from 'lucide-react';

export const About = () => {
    return (
        <section id="about" className="container py-24 sm:py-32">
            <div className="bg-muted/50 border rounded-lg py-12">
                <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-[300px] h-[300px] bg-primary/10 rounded-lg flex items-center justify-center">
                            <LineChart className="w-32 h-32 text-primary/60" />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="pb-6">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                                    FUDD{' '}
                                </span>
                                Financial Unified Data Dashboard
                            </h2>
                            <p className="text-xl text-muted-foreground mt-4">
                                FUDD is a comprehensive financial modeling platform that combines
                                eight essential valuation and analysis tools into a single
                                API-driven application. Built for analysts, investors, and finance
                                professionals, FUDD eliminates spreadsheet errors and provides
                                deterministic, auditable financial calculations.
                            </p>
                            <p className="text-muted-foreground mt-4">
                                The platform includes LBO models, reverse DCF analysis, comparable
                                company valuations, Monte Carlo simulations, M&A accretion/dilution
                                modeling, and financial statement generation — all accessible
                                through a clean REST API or web interface.
                            </p>
                        </div>

                        <Statistics />
                    </div>
                </div>
            </div>
        </section>
    );
};
