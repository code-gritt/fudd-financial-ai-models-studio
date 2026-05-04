'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { login as apiLogin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { FullScreenLoader } from '@/components/ui/loader';
import { siteConfig } from '@/config/site';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiLogin(username, password);

            // Artificial delay to show the nice loader
            await new Promise((resolve) => setTimeout(resolve, 800));

            login(response.user, response.access_token);

            // Set cookie for middleware route protection
            document.cookie = `fudd-auth-token=${response.access_token}; path=/; max-age=86400; samesite=lax`;

            toast.success('Welcome back!', {
                description: `Logged in as ${response.user.full_name}`,
            });

            router.push('/dashboard');
        } catch (err: any) {
            toast.error('Authentication failed', {
                description: err.message || 'Please check your credentials and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            <FullScreenLoader isLoading={isLoading} />

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px]" />
            </div>

            <div className="container relative z-10 px-4 flex items-center justify-center">
                <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white">
                    {/* Left Side: Branding/Info */}
                    <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-50 border-r border-slate-100">
                        <div>
                            <div className="space-y-8">
                                <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                                    The Future of{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                        Financial Modeling
                                    </span>{' '}
                                    is here.
                                </h1>

                                <div className="space-y-4">
                                    {[
                                        {
                                            icon: ShieldCheck,
                                            text: 'Enterprise-grade security standards',
                                        },
                                        { icon: Zap, text: 'Real-time stochastic simulations' },
                                        { icon: Globe, text: 'Global market data integration' },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 text-slate-600"
                                        >
                                            <item.icon className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="text-slate-400 text-xs font-medium">
                            &copy; 2024 {siteConfig.title} Studio. Trusted by top financial analysts
                            worldwide.
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="mb-8 lg:hidden flex flex-col items-center">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Welcome Back
                            </h2>
                        </div>

                        <div className="space-y-2 mb-8 hidden lg:block">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Sign In
                            </h2>
                            <p className="text-slate-500">
                                Enter your credentials to access your studio
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-semibold text-slate-700 ml-1"
                                        htmlFor="username"
                                    >
                                        Username
                                    </label>
                                    <Input
                                        id="username"
                                        placeholder="Enter SUPER"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-100 transition-all rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label
                                            className="text-sm font-semibold text-slate-700"
                                            htmlFor="password"
                                        >
                                            Password
                                        </label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter PASS123"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-100 transition-all rounded-xl"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all duration-300 group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Login{' '}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
    );
}
