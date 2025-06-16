import { NextResponse } from 'next/server';
const locales = ['en', 'br', 'es'];
function getLocale(request) {
    var _a;
    // Check cookie first
    const cookieLocale = (_a = request.cookies.get('preferredLanguage')) === null || _a === void 0 ? void 0 : _a.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
        return cookieLocale;
    }
    // Check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const browserLang = acceptLanguage.split(',')[0].split('-')[0];
    if (browserLang === 'pt')
        return 'br';
    if (browserLang === 'es')
        return 'es';
    return 'en'; // default
}
export function middleware(request) {
    const pathname = request.nextUrl.pathname;
    // Check if locale is already in the path
    const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
    if (!pathnameHasLocale) {
        const locale = getLocale(request);
        // For English, we don't add prefix
        if (locale === 'en') {
            // Add /en/ prefix for internal routing
            const newUrl = new URL(`/en${pathname}`, request.url);
            return NextResponse.rewrite(newUrl);
        }
        else {
            // For other languages, redirect to prefixed URL
            const newUrl = new URL(`/${locale}${pathname}`, request.url);
            return NextResponse.redirect(newUrl);
        }
    }
    // Handle old /pt/ URLs
    if (pathname.startsWith('/pt/')) {
        const newUrl = new URL(pathname.replace('/pt/', '/br/'), request.url);
        return NextResponse.redirect(newUrl, 301);
    }
    // For /en/ paths, we rewrite to remove the prefix from the URL bar
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const newPathname = pathname.replace(/^\/en/, '') || '/';
        const newUrl = new URL(newPathname, request.url);
        // Create response with rewrite
        const response = NextResponse.rewrite(new URL(pathname, request.url));
        // Set the actual URL without /en/
        response.headers.set('x-pathname', newPathname);
        return response;
    }
    return NextResponse.next();
}
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
