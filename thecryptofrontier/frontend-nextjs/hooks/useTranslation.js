import { useRouter } from 'next/navigation';
import pt from '@/locales/pt.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
const translations = {
    pt,
    en,
    es
};
export function useTranslation() {
    const router = useRouter();
    // Detectar idioma atual da URL
    const getLocale = () => {
        if (typeof window === 'undefined')
            return 'pt';
        const pathSegments = window.location.pathname.split('/');
        const locale = pathSegments[1];
        if (['pt', 'en', 'es'].includes(locale)) {
            return locale;
        }
        return 'pt';
    };
    const locale = getLocale();
    const t = translations[locale];
    // Função helper para acessar traduções aninhadas
    const translate = (key) => {
        const keys = key.split('.');
        let value = t;
        for (const k of keys) {
            value = value === null || value === void 0 ? void 0 : value[k];
        }
        return value || key;
    };
    return {
        t,
        translate,
        locale
    };
}
