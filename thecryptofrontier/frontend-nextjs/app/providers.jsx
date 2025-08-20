"use client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
export function Providers({ children, ...props }) {
    return (<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange {...props}>
      {children}
      <Toaster />
    </ThemeProvider>);
}
