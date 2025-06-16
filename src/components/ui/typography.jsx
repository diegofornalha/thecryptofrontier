import { cn } from "@/lib/utils";
export function H1({ children, className }) {
    return (<h1 className={cn("scroll-m-20 text-4xl font-bold tracking-tight font-serif", className)}>
      {children}
    </h1>);
}
export function H2({ children, className }) {
    return (<h2 className={cn("scroll-m-20 text-3xl font-bold tracking-tight font-serif", className)}>
      {children}
    </h2>);
}
export function H3({ children, className }) {
    return (<h3 className={cn("scroll-m-20 text-2xl font-bold tracking-tight font-serif", className)}>
      {children}
    </h3>);
}
export function H4({ children, className }) {
    return (<h4 className={cn("scroll-m-20 text-xl font-bold tracking-tight font-serif", className)}>
      {children}
    </h4>);
}
export function Paragraph({ children, className }) {
    return (<p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>);
}
export function Lead({ children, className }) {
    return (<p className={cn("text-xl text-muted-foreground", className)}>
      {children}
    </p>);
}
export function Large({ children, className }) {
    return (<p className={cn("text-lg font-semibold", className)}>
      {children}
    </p>);
}
export function Small({ children, className }) {
    return (<small className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </small>);
}
export function Subtle({ children, className }) {
    return (<p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>);
}
export function Blockquote({ children, className }) {
    return (<blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic", className)}>
      {children}
    </blockquote>);
}
export function Code({ children, className }) {
    return (<code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm", className)}>
      {children}
    </code>);
}
