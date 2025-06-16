import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-blue-600 text-white shadow hover:bg-blue-700",
            destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
            outline: "border-2 border-blue-500 bg-transparent text-blue-600 shadow-sm hover:bg-blue-50",
            secondary: "bg-purple-600 text-white shadow-sm hover:bg-purple-700",
            ghost: "hover:bg-blue-100 hover:text-blue-700",
            link: "text-blue-600 underline-offset-4 hover:underline",
        },
        size: {
            default: "h-11 px-5 py-2.5",
            sm: "h-9 rounded-lg px-4 text-sm",
            lg: "h-12 rounded-xl px-10 text-lg",
            icon: "h-11 w-11",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = "Button";
export { Button, buttonVariants };
