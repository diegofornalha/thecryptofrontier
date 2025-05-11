import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface LinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: any;
}

export default function Link({ children, href, className, ...other }: LinkProps) {
    // Verificar se é um link interno
    const internal = href ? /^\/(?!\/)/.test(href) : false;
    
    return (
        <Button
            variant="link"
            className={cn("p-0 h-auto", className)}
            asChild
            {...other}
        >
            {internal ? (
                <NextLink href={href}>
                    {children}
                </NextLink>
            ) : (
                <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            )}
        </Button>
    );
} 