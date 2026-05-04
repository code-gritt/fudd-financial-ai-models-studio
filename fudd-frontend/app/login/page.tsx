"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { login as apiLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LogoIcon } from "@/components/Icons";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Loader2, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiLogin(username, password);
      login(response.user, response.access_token);

      // Set cookie for middleware route protection
      document.cookie = `fudd-auth-token=${response.access_token}; path=/; max-age=86400; samesite=lax`;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Decorative Elements (Soft & Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px]" />
      </div>

      <div className="container relative z-10 px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white"
        >
          {/* Left Side: Branding/Info (Light Premium) */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-50 border-r border-slate-100">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-12">
                <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
                  <LogoIcon className="text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-slate-900 uppercase">{siteConfig.title}</span>
              </Link>
              
              <div className="space-y-8">
                <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                  The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Financial Modeling</span> is here.
                </h1>
                
                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "Enterprise-grade security standards" },
                    { icon: Zap, text: "Real-time stochastic simulations" },
                    { icon: Globe, text: "Global market data integration" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-center gap-3 text-slate-600"
                    >
                      <item.icon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-slate-400 text-xs font-medium">
              &copy; 2024 {siteConfig.title} Studio. Trusted by top financial analysts worldwide.
            </div>
          </div>

          {/* Right Side: Login Form (Light) */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-8 lg:hidden flex flex-col items-center">
               <div className="p-2 bg-slate-900 rounded-lg mb-4">
                  <LogoIcon className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            </div>
            
            <div className="space-y-2 mb-8 hidden lg:block">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-slate-500">Enter your credentials to access your studio</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1" htmlFor="username">
                    Username
                  </label>
                  <div className="relative group">
                    <Input
                      id="username"
                      placeholder="e.g. SUPER"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-100 transition-all rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                      Password
                    </label>
                    <Link href="#" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-100 transition-all rounded-xl"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all duration-300 group overflow-hidden relative"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Access Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              <div className="pt-4 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  New to FUDD?{" "}
                  <Link href="#" className="text-slate-900 hover:text-blue-600 transition-colors font-bold">
                    Request an invite
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Decorative Background Patterns */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
    </div>
  );
}
