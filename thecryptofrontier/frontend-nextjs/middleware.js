import { NextResponse } from 'next/server';

const locales = ['en', 'br', 'es'];
const defaultLocale = 'en';

function getLocale(request) {
    const cookieLocale = request.cookies.get('preferredLanguage')?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
        return cookieLocale;
    }

    const acceptLanguage = request.headers.get('accept-language') || '';
    const browserLang = acceptLanguage.split(',')[0].split('-')[0];
    
    if (browserLang === 'pt') return 'br';
    if (browserLang === 'es') return 'es';
    
    return defaultLocale;
}

export function middleware(request) {
    const pathname = request.nextUrl.pathname;

    // 1. Redirecionar /pt para /br permanentemente
    if (pathname.startsWith('/pt')) {
        const newPath = pathname.replace('/pt', '/br');
        return NextResponse.redirect(new URL(newPath, request.url), 301);
    }

    // 2. Identificar se o locale está ausente na URL
    const isSpecialPostPath = pathname.startsWith('/post/') && (pathname.endsWith('-en/') || pathname.endsWith('-es/') || pathname.endsWith('-br/'));

    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    ) && !isSpecialPostPath;

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);

        // 3. Se o locale for o padrão (en), reescrever para /en sem redirecionar
        if (locale === defaultLocale) {
            const newUrl = new URL(`/en${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url);
            return NextResponse.rewrite(newUrl);
        } 
        // 4. Para outros locales, redirecionar para a URL com prefixo
        else {
            const newUrl = new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url);
            return NextResponse.redirect(newUrl);
        }
    }

    // 5. Se a URL já tem um locale, continuar normalmente
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
