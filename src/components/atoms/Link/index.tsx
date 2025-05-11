import * as React from 'react';
import NextLink from 'next/link';
import { cn } from "@/lib/utils";

export default function Link({ children, href, className, ...other }) {
    // Pass Any internal link to Next.js Link, for anything else, use <a> tag
    const internal = /^\/(?!\/)/.test(href);
    
    // Classes padrão para links
    const linkClasses = cn(
        'transition-colors hover:text-foreground/80',
        className
    );
    
    if (internal) {
        return (
            <NextLink href={href} className={linkClasses} {...other}>
                {children}
            </NextLink>
        );
    }

    return (
        <a href={href} className={linkClasses} {...other}>
            {children}
        </a>
    );
}
