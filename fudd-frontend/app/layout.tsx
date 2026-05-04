import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { fontSans } from "@/styles/fonts";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { LayoutProvider } from "@/components/layout-provider";

import "./globals.css";
import { siteConfig } from "@/config/site";

const { title, description } = siteConfig;

export const metadata: Metadata = {
  title: title,
  description: description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LayoutProvider>{children}</LayoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
