import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
} 