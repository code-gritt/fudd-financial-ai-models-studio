import Link from 'next/link';
import { LogoIcon } from './Icons';

export const Footer = () => {
    return (
        <footer id="footer">
            <hr className="w-11/12 mx-auto" />

            <section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
                <div className="col-span-full xl:col-span-2">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <LogoIcon />
                        <span>FUDD</span>
                        <span className="text-xs text-muted-foreground font-normal">
                            Financial Unified Data Dashboard
                        </span>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4 max-w-xs">
                        Professional financial modeling API and web platform for LBO, DCF, Comps,
                        Monte Carlo, and M&A analysis.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Resources</h3>
                    <div>
                        <Link
                            href="https://github.com/yourusername/fudd-financial-models"
                            target="_blank"
                            className="opacity-60 hover:opacity-100"
                        >
                            GitHub
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            API Documentation
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Model Examples
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Release Notes
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Products</h3>
                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Self-Hosted
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Cloud API
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Enterprise
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Custom Models
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Company</h3>
                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            About
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Pricing
                        </Link>
                    </div>

                    <div>
                        <Link href="#faq" className="opacity-60 hover:opacity-100">
                            FAQ
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Contact
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg">Legal</h3>
                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Privacy Policy
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Terms of Service
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            License (MIT)
                        </Link>
                    </div>

                    <div>
                        <Link href="#" className="opacity-60 hover:opacity-100">
                            Security
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container pb-14 text-center">
                <h3 className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} FUDD - Financial Unified Data Dashboard. Open
                    source under MIT license.
                </h3>
            </section>
        </footer>
    );
};
