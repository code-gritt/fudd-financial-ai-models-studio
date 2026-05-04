"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  isLoading: boolean;
  text?: string;
}

export const FullScreenLoader = ({ isLoading, text = "Authenticating..." }: LoaderProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md transition-opacity duration-300">
      <div className="relative flex flex-col items-center">
        <div className="p-3 rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        
        <p className="mt-4 text-slate-900 font-bold tracking-tight animate-in slide-in-from-bottom-2 duration-300">
          {text}
        </p>
      </div>
    </div>
  );
};
