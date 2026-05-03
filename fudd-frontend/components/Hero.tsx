import { Button } from './ui/button';
import { buttonVariants } from './ui/button';
import { HeroCards } from './HeroCards';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export const Hero = () => {
    return (
        <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
            <div className="text-center lg:text-start space-y-6">
                <main className="text-5xl md:text-6xl font-bold">
                    <h1 className="inline">
                        <span className="inline bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 text-transparent bg-clip-text">
                            Financial Unified Data Dashboard
                        </span>
                    </h1>
                </main>

                <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
                    LBO, DCF, Comps, Monte Carlo, and M&A models in one API-driven platform. Built
                    for analysts, founders, and finance professionals who need accurate numbers
                    without spreadsheet headaches.
                </p>

                <div className="space-y-4 md:space-y-0 md:space-x-4">
                    <Button className="w-full md:w-1/3">Launch Models →</Button>

                    <Link
                        href="https://github.com/yourusername/fudd-financial-models"
                        target="_blank"
                        className={`w-full md:w-1/3 ${buttonVariants({
                            variant: 'outline',
                        })}`}
                    >
                        GitHub
                        <GitHubLogoIcon className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="z-10">
                <HeroCards />
            </div>

            <div className="shadow"></div>
        </section>
    );
};
