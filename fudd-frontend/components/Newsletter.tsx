'use client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';

export const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            console.log('Subscribed email:', email);
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <section id="newsletter">
            <hr className="w-11/12 mx-auto" />

            <div className="container py-24 sm:py-32">
                <h3 className="text-center text-4xl md:text-5xl font-bold">
                    Financial Model Updates
                    <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                        {' '}
                        Delivered Weekly
                    </span>
                </h3>
                <p className="text-xl text-muted-foreground text-center mt-4 mb-8">
                    New models, API updates, and financial engineering resources. No spam.
                </p>

                <form
                    className="flex flex-col w-full md:flex-row md:w-6/12 lg:w-4/12 mx-auto gap-4 md:gap-2"
                    onSubmit={handleSubmit}
                >
                    <Input
                        placeholder="analyst@company.com"
                        className="bg-muted/50 dark:bg-muted/80"
                        aria-label="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit">{subscribed ? 'Subscribed ✓' : 'Subscribe'}</Button>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-4">
                    No spam. Unsubscribe anytime.
                </p>
            </div>

            <hr className="w-11/12 mx-auto" />
        </section>
    );
};
