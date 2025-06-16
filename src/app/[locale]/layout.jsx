import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/contexts/LocaleContext';
const locales = ['en', 'br', 'es'];
export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}
export default function LocaleLayout({ children, params: { locale } }) {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale)) {
        notFound();
    }
    return (<LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>);
}
