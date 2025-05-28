"use client"

import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { type ThemeProviderProps } from "next-themes"
import { ReactNode } from "react"

interface ProvidersProps extends ThemeProviderProps {
  children: ReactNode
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
} 