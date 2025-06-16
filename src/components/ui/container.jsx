import { cn } from "@/lib/utils";
export function Container({ className, ...props }) {
    return (<div className={cn("w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8", className)} {...props}/>);
}
