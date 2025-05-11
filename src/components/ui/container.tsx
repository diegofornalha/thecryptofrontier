import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg" | "full"
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full",
          {
            "max-w-screen-xl px-4 md:px-6 lg:px-8": size === "default",
            "max-w-screen-md px-4 md:px-6": size === "sm",
            "max-w-screen-2xl px-4 md:px-6 lg:px-8": size === "lg",
            "px-4 md:px-6 lg:px-8": size === "full",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container } 