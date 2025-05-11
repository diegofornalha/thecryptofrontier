"use client"

import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { ReactNode } from "react"

interface ProvidersProps extends ThemeProviderProps {
  children: ReactNode
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
} 